package com.gmw.General.Mechanical.Works.order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.cart.Cart;
import com.gmw.General.Mechanical.Works.cart.CartRepository;
import com.gmw.General.Mechanical.Works.product.Product;
import com.gmw.General.Mechanical.Works.product.ProductRepository;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class OrderService {

	private static final BigDecimal TAX_RATE = new BigDecimal("0.13");
	private static final DateTimeFormatter PLACED_AT_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT);
	private static final DateTimeFormatter CANCELLED_AT_FORMAT =
			DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

	private final ShopOrderRepository shopOrderRepository;
	private final CartRepository cartRepository;
	private final UserRepository userRepository;
	private final ProductRepository productRepository;

	public OrderService(
			ShopOrderRepository shopOrderRepository,
			CartRepository cartRepository,
			UserRepository userRepository,
			ProductRepository productRepository) {
		this.shopOrderRepository = shopOrderRepository;
		this.cartRepository = cartRepository;
		this.userRepository = userRepository;
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public List<OrderDto> listAllForAdmin() {
		return shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc().stream()
				.sorted(adminOrderDisplayOrder())
				.map(OrderMapper::toDto)
				.toList();
	}

	private static Comparator<ShopOrder> adminOrderDisplayOrder() {
		return Comparator
				.comparing((ShopOrder order) -> order.getStatus() == OrderStatus.CANCELLED)
				.thenComparing(ShopOrder::getPlacedAt, Comparator.reverseOrder());
	}

	@Transactional(readOnly = true)
	public List<OrderDto> listForUser(String email) {
		return shopOrderRepository.findByUserEmailWithLinesOrderByPlacedAtDesc(email.trim()).stream()
				.map(OrderMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<OrderDto> listForUserId(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return shopOrderRepository.findByUserIdWithLinesOrderByPlacedAtDesc(userId).stream()
				.map(OrderMapper::toDto)
				.toList();
	}

	@Transactional
	public OrderDto placeOrder(String email, PlaceOrderRequest request) {
		if (!"COD".equalsIgnoreCase(request.getPaymentMethod().trim())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only COD payment is supported for now");
		}

		User user = requireUser(email);
		List<Long> cartLineIds = request.getCartLineIds();
		if (cartLineIds.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No cart items selected");
		}

		List<Cart> cartLines = new ArrayList<>();
		for (Long cartLineId : cartLineIds) {
			Cart cart = cartRepository.findByIdAndUser_Id(cartLineId, user.getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"One or more cart items are invalid"));
			cartLines.add(cart);
		}

		BigDecimal subtotal = BigDecimal.ZERO;
		for (Cart cart : cartLines) {
			Product product = cart.getProduct();
			if (!product.isActive()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						product.getName() + " is no longer available");
			}
			if (product.getStock() < cart.getQuantity()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Not enough stock for " + product.getName());
			}
			subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(cart.getQuantity())));
		}

		BigDecimal taxAmount = subtotal.multiply(TAX_RATE).setScale(0, RoundingMode.HALF_UP);
		BigDecimal total = subtotal.add(taxAmount);

		ShopOrder order = new ShopOrder();
		order.setOrderNumber(generateOrderNumber());
		order.setUser(user);
		order.setCustomerName(user.getName());
		order.setCustomerEmail(user.getEmail());
		order.setPhone(StringUtils.hasText(user.getPhone()) ? user.getPhone() : null);
		order.setAddress(StringUtils.hasText(user.getLocation()) ? user.getLocation() : "Address not provided");
		order.setStatus(OrderStatus.PENDING);
		order.setPaymentMethod(PaymentMethod.COD);
		order.setSubtotal(subtotal);
		order.setTaxAmount(taxAmount);
		order.setTotal(total);

		for (Cart cart : cartLines) {
			Product product = cart.getProduct();
			OrderLine line = new OrderLine();
			line.setProductId(product.getId());
			line.setProductName(product.getName());
			line.setSku(product.getSku());
			line.setQuantity(cart.getQuantity());
			line.setUnitPrice(product.getPrice());
			line.setSizeLabel(cart.getSizeLabel());
			List<String> images = product.getImagePathsList();
			line.setImagePath(images.isEmpty() ? null : images.get(0));
			order.addLine(line);

			product.setStock(product.getStock() - cart.getQuantity());
		}

		ShopOrder saved = shopOrderRepository.save(order);
		cartRepository.deleteAll(cartLines);
		return OrderMapper.toDto(saved);
	}

	@Transactional
	public OrderDto updateStatusForAdmin(Long orderId, UpdateOrderStatusRequest request) {
		ShopOrder order = shopOrderRepository.findById(orderId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
		OrderStatus current = order.getStatus();
		OrderStatus next = request.getStatus();

		if (current == OrderStatus.CANCELLED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cancelled orders cannot be updated");
		}
		if (next == OrderStatus.CANCELLED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only customers can cancel orders");
		}
		if (rank(next) < rank(current)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status cannot move backwards");
		}

		order.setStatus(next);
		return OrderMapper.toDto(shopOrderRepository.save(order));
	}

	@Transactional
	public OrderDto cancelOrderLineForUser(String email, Long orderId, Long lineId) {
		User user = requireUser(email);
		ShopOrder order = shopOrderRepository.findByIdAndUser_IdWithLines(orderId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

		OrderStatus orderStatus = order.getStatus();
		if (orderStatus != OrderStatus.PENDING && orderStatus != OrderStatus.CONFIRMED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Only pending or confirmed orders can be cancelled");
		}

		OrderLine line = order.getLines().stream()
				.filter(l -> l.getId().equals(lineId))
				.findFirst()
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order item not found"));

		if (line.isCancelled()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This product is already cancelled");
		}

		LocalDateTime now = LocalDateTime.now();
		line.setCancelled(true);
		line.setCancelledAt(now);

		Product product = productRepository.findById(line.getProductId()).orElse(null);
		if (product != null) {
			product.setStock(product.getStock() + line.getQuantity());
		}

		boolean allCancelled = order.getLines().stream().allMatch(OrderLine::isCancelled);
		if (allCancelled) {
			order.setStatus(OrderStatus.CANCELLED);
			order.setCancelledAt(now);
		}

		return OrderMapper.toDto(shopOrderRepository.save(order));
	}

	private static int rank(OrderStatus status) {
		return switch (status) {
			case PENDING -> 0;
			case CONFIRMED -> 1;
			case SHIPPED -> 2;
			case DELIVERED -> 3;
			case CANCELLED -> -1;
		};
	}

	private String generateOrderNumber() {
		long count = shopOrderRepository.count() + 1;
		return "ORD-" + String.format(Locale.ROOT, "%04d", 2400 + count);
	}

	private User requireUser(String email) {
		return userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
	}

	static final class OrderMapper {

		private OrderMapper() {
		}

		static OrderDto toDto(ShopOrder order) {
			return new OrderDto(
					order.getId(),
					order.getOrderNumber(),
					order.getCustomerName(),
					order.getCustomerEmail(),
					order.getPhone(),
					order.getAddress(),
					order.getPlacedAt().toLocalDate().format(PLACED_AT_FORMAT),
					order.getStatus(),
					order.getPaymentMethod(),
					order.getSubtotal(),
					order.getTaxAmount(),
					order.getTotal(),
					order.getLines().stream()
							.map(line -> new OrderLineDto(
									line.getId(),
									line.getProductName(),
									line.getSku(),
									line.getQuantity(),
									line.getUnitPrice(),
									line.getSizeLabel(),
									line.getImagePath(),
									line.isCancelled(),
									formatCancelledAt(line.getCancelledAt())))
							.toList());
		}

		private static String formatCancelledAt(LocalDateTime cancelledAt) {
			if (cancelledAt == null) {
				return null;
			}
			return cancelledAt.format(CANCELLED_AT_FORMAT);
		}
	}
}
