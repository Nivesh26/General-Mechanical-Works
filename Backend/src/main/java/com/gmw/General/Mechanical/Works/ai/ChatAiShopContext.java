package com.gmw.General.Mechanical.Works.ai;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.product.Product;
import com.gmw.General.Mechanical.Works.product.ProductRepository;

@Component
public class ChatAiShopContext {

	private static final int MAX_PRODUCTS_IN_PROMPT = 60;

	private static final List<String> WORKSHOP_SERVICES = List.of(
			"Service Work",
			"Tyre Repair",
			"Bike Wash",
			"Engine Repair",
			"Dent & painting",
			"Modify bike",
			"Battery Service",
			"Chain & Sprocket",
			"Other");

	private final ProductRepository productRepository;

	public ChatAiShopContext(ProductRepository productRepository) {
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public String buildCatalogSection() {
		return buildCatalogSection(null);
	}

	@Transactional(readOnly = true)
	public String buildCatalogSection(String userMessage) {
		List<Product> products = productRepository.findAllByActiveTrueOrderByCreatedAtDesc();
		if (products.isEmpty()) {
			return """
					PRODUCT CATALOG: (empty — no products listed right now)
					If asked about parts or products, say our team can help and suggest browsing the shop website.
					""";
		}
		List<Product> relevant = filterRelevantProducts(products, userMessage);
		List<Product> toShow = relevant.isEmpty() ? products.stream().limit(15).toList() : relevant;
		String lines = toShow.stream()
				.limit(MAX_PRODUCTS_IN_PROMPT)
				.map(this::formatProductLine)
				.collect(Collectors.joining("\n"));
		String header = relevant.isEmpty()
				? "PRODUCT CATALOG (sample — mention only if customer asks about products):"
				: "PRODUCT CATALOG (matching customer question — use ONLY these):";
		return """
				%s
				%s
				""".formatted(header, lines);
	}

	private List<Product> filterRelevantProducts(List<Product> products, String userMessage) {
		if (!StringUtils.hasText(userMessage)) {
			return List.of();
		}
		String normalized = userMessage.trim().toLowerCase();
		String[] terms = normalized.split("\\s+");
		return products.stream()
				.filter(product -> matchesProduct(product, terms, normalized))
				.limit(MAX_PRODUCTS_IN_PROMPT)
				.toList();
	}

	private boolean matchesProduct(Product product, String[] terms, String fullMessage) {
		String haystack = (product.getSku() + " " + product.getName() + " " + product.getCategory())
				.toLowerCase();
		for (String term : terms) {
			if (term.length() >= 3 && haystack.contains(term)) {
				return true;
			}
		}
		return fullMessage.length() >= 4 && haystack.contains(fullMessage);
	}

	public String buildServicesSection() {
		return """
				WORKSHOP SERVICES (for appointments — prices are quoted by the team):
				%s
				""".formatted(String.join(", ", WORKSHOP_SERVICES));
	}

	private String formatProductLine(Product product) {
		String stock = product.getStock() > 0 ? "in stock" : "out of stock";
		return "- SKU: %s | %s | Category: %s | Price: Rs. %s | %s".formatted(
				product.getSku(),
				product.getName(),
				product.getCategory(),
				product.getPrice().stripTrailingZeros().toPlainString(),
				stock);
	}
}
