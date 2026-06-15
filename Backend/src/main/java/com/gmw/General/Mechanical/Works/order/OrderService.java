package com.gmw.General.Mechanical.Works.order;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.payment.EsewaCallbackPayload;
import com.gmw.General.Mechanical.Works.cart.Cart;
import com.gmw.General.Mechanical.Works.cart.CartRepository;
import com.gmw.General.Mechanical.Works.payment.EsewaInitResponse;
import com.gmw.General.Mechanical.Works.payment.EsewaPaymentInitResponse;
import com.gmw.General.Mechanical.Works.payment.EsewaService;
import com.gmw.General.Mechanical.Works.payment.KhaltiInitResponse;
import com.gmw.General.Mechanical.Works.payment.KhaltiService;
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
	private final EsewaService esewaService;
	private final KhaltiService khaltiService;

	public OrderService(
			ShopOrderRepository shopOrderRepository,
			CartRepository cartRepository,
			UserRepository userRepository,
			ProductRepository productRepository,
			EsewaService esewaService,
			KhaltiService khaltiService) {
		this.shopOrderRepository = shopOrderRepository;
		this.cartRepository = cartRepository;
		this.userRepository = userRepository;
		this.productRepository = productRepository;
		this.esewaService = esewaService;
		this.khaltiService = khaltiService;
	}

	@Transactional
	public List<OrderDto> listAllForAdmin() {
		cancelAbandonedUnpaidEsewaOrders();
		cancelAbandonedUnpaidKhaltiOrders();
		return shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc().stream()
				.filter(OrderService::isRealOrder)
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
				.filter(OrderService::isRealOrder)
				.map(OrderMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<OrderDto> listForUserId(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return shopOrderRepository.findByUserIdWithLinesOrderByPlacedAtDesc(userId).stream()
				.filter(OrderService::isRealOrder)
				.map(OrderMapper::toDto)
				.toList();
	}

	private static boolean isRealOrder(ShopOrder order) {
		if (order.getPaymentMethod() == PaymentMethod.COD) {
			return true;
		}
		return order.isPaid();
	}

	@Transactional
	public void cancelAbandonedUnpaidEsewaOrders() {
		for (ShopOrder order : shopOrderRepository.findUnpaidEsewaPendingWithLines()) {
			cancelUnpaidOnlineOrder(order);
		}
	}

	@Transactional
	public void cancelAbandonedUnpaidKhaltiOrders() {
		for (ShopOrder order : shopOrderRepository.findUnpaidKhaltiPendingWithLines()) {
			cancelUnpaidOnlineOrder(order);
		}
	}

	private void cancelAbandonedUnpaidEsewaForUser(User user) {
		for (ShopOrder order : shopOrderRepository.findByUserIdWithLinesOrderByPlacedAtDesc(user.getId())) {
			if (order.getPaymentMethod() == PaymentMethod.ESEWA
					&& !order.isPaid()
					&& order.getStatus() == OrderStatus.PENDING) {
				cancelUnpaidOnlineOrder(order);
			}
		}
	}

	private void cancelAbandonedUnpaidKhaltiForUser(User user) {
		for (ShopOrder order : shopOrderRepository.findByUserIdWithLinesOrderByPlacedAtDesc(user.getId())) {
			if (order.getPaymentMethod() == PaymentMethod.KHALTI
					&& !order.isPaid()
					&& order.getStatus() == OrderStatus.PENDING) {
				cancelUnpaidOnlineOrder(order);
			}
		}
	}

	private void cancelUnpaidOnlineOrder(ShopOrder order) {
		order.setStatus(OrderStatus.CANCELLED);
		order.setCancelledAt(LocalDateTime.now());
		order.setPendingCartLineIds(null);
		shopOrderRepository.save(order);
	}

	@Transactional
	public OrderDto placeOrder(String email, PlaceOrderRequest request) {
		if (!"COD".equalsIgnoreCase(request.getPaymentMethod().trim())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use online payment init endpoint for online payment");
		}

		User user = requireUser(email);
		PreparedOrder prepared = prepareOrder(user, request.getCartLineIds());

		ShopOrder order = prepared.order();
		order.setPaymentMethod(PaymentMethod.COD);
		order.setPaid(true);

		applyStockDeduction(prepared.cartLines());
		ShopOrder saved = shopOrderRepository.save(order);
		cartRepository.deleteAll(prepared.cartLines());
		return OrderMapper.toDto(saved);
	}

	@Transactional
	public EsewaInitResponse initEsewaPayment(String email, PlaceOrderRequest request) {
		if (!"ESEWA".equalsIgnoreCase(request.getPaymentMethod().trim())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method must be ESEWA");
		}

		User user = requireUser(email);
		cancelAbandonedUnpaidEsewaForUser(user);
		PreparedOrder prepared = prepareOrder(user, request.getCartLineIds());

		String transactionUuid = esewaService.newTransactionUuid();
		ShopOrder order = prepared.order();
		order.setPaymentMethod(PaymentMethod.ESEWA);
		order.setPaid(false);
		order.setEsewaTransactionUuid(transactionUuid);
		order.setPendingCartLineIds(joinCartLineIds(request.getCartLineIds()));

		ShopOrder saved = shopOrderRepository.save(order);
		return new EsewaInitResponse(saved.getId());
	}

	@Transactional
	public KhaltiInitResponse initKhaltiPayment(String email, PlaceOrderRequest request) {
		if (!"KHALTI".equalsIgnoreCase(request.getPaymentMethod().trim())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment method must be KHALTI");
		}

		User user = requireUser(email);
		cancelAbandonedUnpaidKhaltiForUser(user);
		PreparedOrder prepared = prepareOrder(user, request.getCartLineIds());

		ShopOrder order = prepared.order();
		order.setPaymentMethod(PaymentMethod.KHALTI);
		order.setPaid(false);
		order.setPendingCartLineIds(joinCartLineIds(request.getCartLineIds()));

		ShopOrder saved = shopOrderRepository.save(order);
		KhaltiService.KhaltiPaymentSession session = khaltiService.initiatePayment(saved, user);
		saved.setKhaltiPidx(session.pidx());
		shopOrderRepository.save(saved);

		return new KhaltiInitResponse(session.paymentUrl(), saved.getId());
	}

	@Transactional(readOnly = true)
	public EsewaPaymentInitResponse buildEsewaLaunchForm(String email, Long orderId) {
		User user = requireUser(email);
		ShopOrder order = shopOrderRepository.findByIdAndUser_IdWithLines(orderId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

		if (order.getPaymentMethod() != PaymentMethod.ESEWA) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This order is not an eSewa payment");
		}
		if (order.isPaid()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This order is already paid");
		}
		if (!StringUtils.hasText(order.getEsewaTransactionUuid())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eSewa payment session is missing");
		}

		return esewaService.buildPaymentForm(
				order.getId(),
				order.getOrderNumber(),
				order.getSubtotal(),
				order.getTaxAmount(),
				order.getTotal(),
				order.getEsewaTransactionUuid());
	}

	@Transactional
	public OrderDto completeEsewaPayment(String transactionUuid, EsewaCallbackPayload payload) {
		ShopOrder order = shopOrderRepository.findByEsewaTransactionUuid(transactionUuid)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

		if (order.isPaid()) {
			return OrderMapper.toDto(order);
		}

		if (!"COMPLETE".equalsIgnoreCase(payload.status())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eSewa payment was not completed");
		}

		esewaService.verifyWithEsewaStatusApi(transactionUuid, order.getTotal());

		List<Cart> cartLines = loadPendingCartLines(order);
		applyStockDeduction(cartLines);
		order.setPaid(true);
		order.setPendingCartLineIds(null);
		cartRepository.deleteAll(cartLines);

		return OrderMapper.toDto(shopOrderRepository.save(order));
	}

	@Transactional
	public String failEsewaPayment(String transactionUuid) {
		ShopOrder order = shopOrderRepository.findByEsewaTransactionUuid(transactionUuid)
				.orElse(null);
		if (order == null || order.isPaid()) {
			return null;
		}

		order.setStatus(OrderStatus.CANCELLED);
		order.setCancelledAt(LocalDateTime.now());
		order.setPendingCartLineIds(null);
		shopOrderRepository.save(order);
		return order.getOrderNumber();
	}

	@Transactional
	public OrderDto completeKhaltiPayment(String pidx, String purchaseOrderId) {
		ShopOrder order = shopOrderRepository.findByKhaltiPidx(pidx)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));

		if (order.isPaid()) {
			return OrderMapper.toDto(order);
		}

		KhaltiService.KhaltiLookupResult lookup = khaltiService.lookupPayment(pidx);
		if (!"Completed".equalsIgnoreCase(lookup.status())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Khalti payment was not completed");
		}

		int expectedPaisa = KhaltiService.toPaisa(order.getTotal());
		if (lookup.totalAmountPaisa() != expectedPaisa) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Payment amount does not match order total");
		}

		if (StringUtils.hasText(purchaseOrderId) && !purchaseOrderId.equals(order.getOrderNumber())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order reference mismatch");
		}

		List<Cart> cartLines = loadPendingCartLines(order);
		applyStockDeduction(cartLines);
		order.setPaid(true);
		order.setPendingCartLineIds(null);
		cartRepository.deleteAll(cartLines);

		return OrderMapper.toDto(shopOrderRepository.save(order));
	}

	@Transactional
	public String failKhaltiPayment(String pidx) {
		ShopOrder order = shopOrderRepository.findByKhaltiPidx(pidx).orElse(null);
		if (order == null || order.isPaid()) {
			return null;
		}

		cancelUnpaidOnlineOrder(order);
		return order.getOrderNumber();
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

		if (!order.isPaid()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This order is not paid yet");
		}

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

	private PreparedOrder prepareOrder(User user, List<Long> cartLineIds) {
		if (!StringUtils.hasText(user.getLocation())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Please add your delivery location in your profile before placing an order");
		}
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
		order.setAddress(user.getLocation().trim());
		order.setStatus(OrderStatus.PENDING);
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
		}

		return new PreparedOrder(order, cartLines);
	}

	private void applyStockDeduction(List<Cart> cartLines) {
		for (Cart cart : cartLines) {
			Product product = cart.getProduct();
			if (product.getStock() < cart.getQuantity()) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Not enough stock for " + product.getName());
			}
			product.setStock(product.getStock() - cart.getQuantity());
		}
	}

	private List<Cart> loadPendingCartLines(ShopOrder order) {
		List<Long> cartLineIds = parseCartLineIds(order.getPendingCartLineIds());
		if (cartLineIds.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order cart data is missing");
		}

		List<Cart> cartLines = new ArrayList<>();
		for (Long cartLineId : cartLineIds) {
			Cart cart = cartRepository.findByIdAndUser_Id(cartLineId, order.getUser().getId())
					.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
							"Cart items changed before payment completed"));
			cartLines.add(cart);
		}
		return cartLines;
	}

	private static List<Long> parseCartLineIds(String raw) {
		if (!StringUtils.hasText(raw)) {
			return List.of();
		}
		return java.util.Arrays.stream(raw.split(","))
				.map(String::trim)
				.filter(StringUtils::hasText)
				.map(Long::valueOf)
				.collect(Collectors.toList());
	}

	private static String joinCartLineIds(List<Long> cartLineIds) {
		return cartLineIds.stream()
				.map(String::valueOf)
				.collect(Collectors.joining(","));
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

	private record PreparedOrder(ShopOrder order, List<Cart> cartLines) {
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
