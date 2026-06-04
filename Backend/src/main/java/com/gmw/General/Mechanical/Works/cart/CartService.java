package com.gmw.General.Mechanical.Works.cart;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.product.Product;
import com.gmw.General.Mechanical.Works.product.ProductRepository;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class CartService {

	private final CartRepository cartRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;

	public CartService(
			CartRepository cartRepository,
			ProductRepository productRepository,
			UserRepository userRepository) {
		this.cartRepository = cartRepository;
		this.productRepository = productRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public List<CartItemDto> listForUser(String email) {
		User user = requireUser(email);
		return cartRepository.findAllByUser_IdOrderByUpdatedAtDesc(user.getId()).stream()
				.map(CartMapper::toDto)
				.toList();
	}

	@Transactional
	public CartItemDto add(String email, CartAddRequest request) {
		User user = requireUser(email);
		Product product = productRepository.findByIdAndActiveTrue(request.productId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
		if (product.getStock() <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is out of stock");
		}

		List<String> sizes = product.getSizesList();
		String sizeLabel = normalizeSizeLabel(request.size(), sizes);

		int requestedQty = request.quantity() == null ? 1 : request.quantity();
		int maxAllowed = maxQuantityFor(product);
		if (requestedQty > maxAllowed) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Quantity cannot exceed available stock (" + maxAllowed + ")");
		}

		Cart cart = cartRepository
				.findByUser_IdAndProduct_IdAndSizeLabel(user.getId(), product.getId(), sizeLabel)
				.orElse(null);
		if (cart != null) {
			int nextQty = cart.getQuantity() + requestedQty;
			if (nextQty > maxAllowed) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Quantity cannot exceed available stock (" + maxAllowed + ")");
			}
			cart.setQuantity(nextQty);
			return CartMapper.toDto(cartRepository.save(cart));
		}

		Cart created = new Cart();
		created.setUser(user);
		created.setProduct(product);
		created.setSizeLabel(sizeLabel);
		created.setQuantity(requestedQty);
		try {
			return CartMapper.toDto(cartRepository.save(created));
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Item is already in your cart");
		}
	}

	@Transactional
	public CartItemDto updateQuantity(String email, Long cartItemId, CartUpdateQuantityRequest request) {
		User user = requireUser(email);
		Cart cart = cartRepository.findByIdAndUser_Id(cartItemId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
		Product product = cart.getProduct();
		if (!product.isActive()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product is no longer available");
		}
		int maxAllowed = maxQuantityFor(product);
		if (request.quantity() > maxAllowed) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Quantity cannot exceed available stock (" + maxAllowed + ")");
		}
		cart.setQuantity(request.quantity());
		return CartMapper.toDto(cartRepository.save(cart));
	}

	@Transactional
	public void remove(String email, Long cartItemId) {
		User user = requireUser(email);
		Cart cart = cartRepository.findByIdAndUser_Id(cartItemId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cart item not found"));
		cartRepository.delete(cart);
	}

	@Transactional
	public void clear(String email) {
		User user = requireUser(email);
		cartRepository.deleteAllByUser_Id(user.getId());
	}

	private static String normalizeSizeLabel(String size, List<String> allowedSizes) {
		boolean hasSizes = !allowedSizes.isEmpty();
		if (!hasSizes) {
			if (StringUtils.hasText(size)) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This product has no size options");
			}
			return "";
		}
		if (!StringUtils.hasText(size)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Size is required for this product");
		}
		String trimmed = size.trim();
		boolean valid = allowedSizes.stream().anyMatch(s -> s.equalsIgnoreCase(trimmed));
		if (!valid) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid size for this product");
		}
		return allowedSizes.stream()
				.filter(s -> s.equalsIgnoreCase(trimmed))
				.findFirst()
				.orElse(trimmed);
	}

	private static int maxQuantityFor(Product product) {
		return product.getStock();
	}

	private User requireUser(String email) {
		return userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
	}
}
