package com.gmw.General.Mechanical.Works.ai;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.payment.AppUrlProperties;
import com.gmw.General.Mechanical.Works.product.Product;

@Component
public class ChatAiProductReplyBuilder {

	private final ChatAiShopContext shopContext;
	private final AppUrlProperties appUrlProperties;

	public ChatAiProductReplyBuilder(ChatAiShopContext shopContext, AppUrlProperties appUrlProperties) {
		this.shopContext = shopContext;
		this.appUrlProperties = appUrlProperties;
	}

	/**
	 * Builds a reply from the database only — no Ollama — so product names, SKUs, and prices cannot be invented.
	 */
	@Transactional(readOnly = true)
	public Optional<ChatAiReply> tryBuildReply(String userMessage) {
		if (!StringUtils.hasText(userMessage)) {
			return Optional.empty();
		}
		if (ChatAiIntent.isServiceBookingIntent(userMessage)) {
			return Optional.empty();
		}
		if (ChatAiIntent.isAddToCartIntent(userMessage)) {
			return Optional.empty();
		}
		if (ChatAiIntent.isMechanicalAdviceQuestion(userMessage)) {
			return Optional.empty();
		}

		List<Product> matches = shopContext.findMatchingProducts(userMessage);
		if (!matches.isEmpty()) {
			return Optional.of(ChatAiReply.withProductImage(formatProductListReply(matches), matches.get(0)));
		}
		if (ChatAiIntent.isProductShoppingQuestion(userMessage)) {
			return Optional.of(ChatAiReply.textOnly(notListedReply()));
		}
		return Optional.empty();
	}

	private String formatProductListReply(List<Product> products) {
		StringBuilder reply = new StringBuilder();
		if (products.size() == 1) {
			reply.append("Yes — we have this item in our shop:\n\n");
		} else {
			reply.append("Yes — we have ").append(products.size()).append(" matching items in our shop:\n\n");
		}
		for (int i = 0; i < products.size(); i++) {
			Product product = products.get(i);
			String stock = product.getStock() > 0 ? "In stock" : "Out of stock";
			reply.append(i + 1).append(". ").append(product.getName()).append('\n');
			reply.append("   SKU: ").append(product.getSku()).append('\n');
			reply.append("   Price: Rs. ").append(product.getPrice().stripTrailingZeros().toPlainString()).append('\n');
			reply.append("   ").append(stock).append('\n');
			reply.append("   ").append(productLink(product.getId())).append("\n\n");
		}
		reply.append("Browse all products: ").append(shopBaseUrl()).append("/products");
		return reply.toString().trim();
	}

	private String notListedReply() {
		return """
				We don't have that item listed in our online shop right now.

				Browse our products: %s/products

				Or tell me another part name and I'll check again. Our team can also help if you need something specific."""
				.formatted(shopBaseUrl())
				.trim();
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
