package com.gmw.General.Mechanical.Works.ai;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.payment.AppUrlProperties;
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
	private final AppUrlProperties appUrlProperties;

	public ChatAiShopContext(ProductRepository productRepository, AppUrlProperties appUrlProperties) {
		this.productRepository = productRepository;
		this.appUrlProperties = appUrlProperties;
	}

	@Transactional(readOnly = true)
	public String buildCatalogSection() {
		return buildCatalogSection(null);
	}

	private static final Set<String> PRODUCT_SEARCH_STOP_WORDS = Set.of(
			"do", "you", "the", "and", "for", "have", "has", "can", "are", "was", "how",
			"any", "show", "need", "want", "buy", "get", "our", "your", "this", "that",
			"with", "from", "what", "does", "will", "would", "could", "please", "about");

	@Transactional(readOnly = true)
	public Optional<Product> findProductBySkuInText(String text) {
		if (!StringUtils.hasText(text)) {
			return Optional.empty();
		}
		String upper = text.toUpperCase();
		return productRepository.findAllByActiveTrueOrderByCreatedAtDesc().stream()
				.filter(product -> upper.contains(product.getSku().toUpperCase()))
				.findFirst();
	}

	@Transactional(readOnly = true)
	public List<Product> findMatchingProducts(String userMessage) {
		List<Product> products = productRepository.findAllByActiveTrueOrderByCreatedAtDesc();
		if (products.isEmpty() || !StringUtils.hasText(userMessage)) {
			return List.of();
		}
		Optional<Product> bySku = findProductBySkuInText(userMessage);
		if (bySku.isPresent()) {
			return List.of(bySku.get());
		}
		return filterRelevantProducts(products, userMessage);
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
		List<String> significant = Arrays.stream(terms)
				.map(String::trim)
				.filter(term -> term.length() >= 3)
				.filter(term -> !PRODUCT_SEARCH_STOP_WORDS.contains(term))
				.toList();
		if (significant.isEmpty()) {
			return fullMessage.length() >= 4 && haystack.contains(fullMessage);
		}
		if (significant.size() == 1) {
			String term = significant.get(0);
			return termMatchesCatalogTerm(term, haystack)
					|| (fullMessage.length() >= 4 && haystack.contains(fullMessage));
		}
		for (String term : significant) {
			if (!termMatchesCatalogTerm(term, haystack)) {
				return false;
			}
		}
		return true;
	}

	private static boolean termMatchesCatalogTerm(String term, String haystack) {
		if (term.length() < 3) {
			return false;
		}
		if (haystack.contains(term)) {
			return true;
		}
		if (term.endsWith("ies") && term.length() > 4) {
			String singular = term.substring(0, term.length() - 3) + "y";
			if (singular.length() >= 3 && haystack.contains(singular)) {
				return true;
			}
		}
		if (term.endsWith("s") && term.length() > 4) {
			String singular = term.substring(0, term.length() - 1);
			if (singular.length() >= 3 && haystack.contains(singular)) {
				return true;
			}
		}
		return false;
	}

	public String buildServicesSection() {
		return """
				WORKSHOP SERVICES (for appointments — prices are quoted by the team):
				%s
				""".formatted(String.join(", ", WORKSHOP_SERVICES));
	}

	public String buildPaymentSection() {
		return """
				PAYMENT METHODS (online shop orders — use ONLY these, do not mention others):
				- Cash on Delivery (COD)
				- eSewa
				- Khalti
				Customers choose at checkout on the website. Do NOT mention credit card, debit card, or other wallets.
				""";
	}

	public static String primaryImagePath(Product product) {
		if (product == null) {
			return null;
		}
		return product.getImagePathsList().stream()
				.filter(StringUtils::hasText)
				.findFirst()
				.orElse(null);
	}

	private String formatProductLine(Product product) {
		String stock = product.getStock() > 0 ? "in stock" : "out of stock";
		String link = productLink(product.getId());
		return "- SKU: %s | %s | Category: %s | Price: Rs. %s | %s | Link: %s".formatted(
				product.getSku(),
				product.getName(),
				product.getCategory(),
				product.getPrice().stripTrailingZeros().toPlainString(),
				stock,
				link);
	}

	private String productLink(Long productId) {
		String base = appUrlProperties.getFrontendUrl();
		if (base == null) {
			base = "http://localhost:5173";
		}
		return base.replaceAll("/+$", "") + "/productdetail/" + productId;
	}
}
