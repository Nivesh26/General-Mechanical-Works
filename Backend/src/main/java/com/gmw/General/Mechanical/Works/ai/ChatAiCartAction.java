package com.gmw.General.Mechanical.Works.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.cart.CartAddRequest;
import com.gmw.General.Mechanical.Works.cart.CartItemDto;
import com.gmw.General.Mechanical.Works.cart.CartService;
import com.gmw.General.Mechanical.Works.chat.ChatMessage;
import com.gmw.General.Mechanical.Works.payment.AppUrlProperties;
import com.gmw.General.Mechanical.Works.product.Product;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Component
public class ChatAiCartAction {

	private static final int HISTORY_LOOKBACK = 10;

	private final CartService cartService;
	private final UserRepository userRepository;
	private final ChatAiShopContext shopContext;
	private final AppUrlProperties appUrlProperties;

	public ChatAiCartAction(
			CartService cartService,
			UserRepository userRepository,
			ChatAiShopContext shopContext,
			AppUrlProperties appUrlProperties) {
		this.cartService = cartService;
		this.userRepository = userRepository;
		this.shopContext = shopContext;
		this.appUrlProperties = appUrlProperties;
	}

	@Transactional
	public Optional<ChatAiReply> tryAddToCart(Long userId, String userMessage, List<ChatMessage> history) {
		if (userId == null || !StringUtils.hasText(userMessage)) {
			return Optional.empty();
		}
		if (!ChatAiIntent.isAddToCartIntent(userMessage)) {
			return Optional.empty();
		}

		User user = userRepository.findById(userId).orElse(null);
		if (user == null || !StringUtils.hasText(user.getEmail())) {
			return Optional.of(ChatAiReply.textOnly("Please log in to add items to your cart."));
		}

		Optional<Product> product = resolveProduct(userMessage, history);
		if (product.isEmpty()) {
			return Optional.of(ChatAiReply.textOnly("""
					Which product should I add? Tell me the product name or SKU (for example: "add BCN-001 to cart")."""
					.trim()));
		}

		Product chosen = product.get();
		if (chosen.getStock() <= 0) {
			return Optional.of(ChatAiReply.textOnly(chosen.getName() + " is out of stock right now. Browse other products at "
					+ shopBaseUrl() + "/products"));
		}

		Optional<String> size = resolveSize(chosen, userMessage);
		if (size.isEmpty()) {
			List<String> sizes = chosen.getSizesList();
			return Optional.of(ChatAiReply.textOnly("""
					%s is available, but please choose a size first.

					Available sizes: %s

					Reply with the size (for example: "add %s size M to cart") or open the product page:
					%s"""
					.formatted(
							chosen.getName(),
							String.join(", ", sizes),
							chosen.getName().toLowerCase(),
							productLink(chosen.getId()))
					.trim()));
		}

		try {
			CartItemDto added = cartService.add(
					user.getEmail(),
					new CartAddRequest(chosen.getId(), 1, size.get()));
			return Optional.of(ChatAiReply.withProductImage(formatAddedReply(added, chosen), chosen));
		} catch (ResponseStatusException ex) {
			return Optional.of(ChatAiReply.textOnly(friendlyCartError(ex, chosen)));
		}
	}

	private Optional<Product> resolveProduct(String userMessage, List<ChatMessage> history) {
		Optional<Product> bySku = shopContext.findProductBySkuInText(userMessage);
		if (bySku.isPresent()) {
			return bySku;
		}

		List<Product> direct = shopContext.findMatchingProducts(userMessage);
		if (direct.size() == 1) {
			return Optional.of(direct.get(0));
		}

		if (ChatAiIntent.refersToPreviousProduct(userMessage) || direct.isEmpty()) {
			Optional<Product> recent = findMostRecentlyReferencedProduct(history);
			if (recent.isPresent()) {
				return recent;
			}
		}

		if (direct.size() > 1) {
			return Optional.empty();
		}
		return Optional.empty();
	}

	private Optional<Product> findMostRecentlyReferencedProduct(List<ChatMessage> history) {
		List<ChatMessage> recent = recentMessages(history, HISTORY_LOOKBACK);
		for (int i = recent.size() - 2; i >= 0; i--) {
			ChatMessage message = recent.get(i);
			if (!StringUtils.hasText(message.getBody())) {
				continue;
			}
			String body = message.getBody().trim();
			Optional<Product> bySku = shopContext.findProductBySkuInText(body);
			if (bySku.isPresent()) {
				return bySku;
			}
			List<Product> matches = shopContext.findMatchingProducts(body);
			if (matches.size() == 1) {
				return Optional.of(matches.get(0));
			}
		}
		return Optional.empty();
	}

	private Optional<String> resolveSize(Product product, String userMessage) {
		List<String> sizes = product.getSizesList();
		if (sizes.isEmpty()) {
			return Optional.of("");
		}
		String normalized = userMessage.toLowerCase();
		for (String size : sizes) {
			if (normalized.contains(size.toLowerCase())) {
				return Optional.of(size);
			}
		}
		if (sizes.size() == 1) {
			return Optional.of(sizes.get(0));
		}
		return Optional.empty();
	}

	private String formatAddedReply(CartItemDto cartItem, Product product) {
		return """
				Done — I've added this to your cart:

				• %s (SKU: %s)
				• Price: Rs. %s
				• Quantity in cart: %d

				View your cart: %s/cart
				Checkout when ready: %s/checkout"""
				.formatted(
						product.getName(),
						product.getSku(),
						product.getPrice().stripTrailingZeros().toPlainString(),
						cartItem.quantity(),
						shopBaseUrl(),
						shopBaseUrl())
				.trim();
	}

	private String friendlyCartError(ResponseStatusException ex, Product product) {
		if (ex.getStatusCode() == HttpStatus.BAD_REQUEST && ex.getReason() != null) {
			return ex.getReason() + "\n\nOpen product page: " + productLink(product.getId());
		}
		return "Could not add " + product.getName() + " to your cart. Please try from the product page: "
				+ productLink(product.getId());
	}

	private static List<ChatMessage> recentMessages(List<ChatMessage> history, int limit) {
		if (history == null || history.isEmpty()) {
			return List.of();
		}
		int start = Math.max(0, history.size() - limit);
		return new ArrayList<>(history.subList(start, history.size()));
	}

	private String productLink(Long productId) {
		return shopBaseUrl() + "/productdetail/" + productId;
	}

	private String shopBaseUrl() {
		String base = appUrlProperties.getFrontendUrl();
		if (base == null) {
			base = "http://localhost:5173";
		}
		return base.replaceAll("/+$", "");
	}
}
