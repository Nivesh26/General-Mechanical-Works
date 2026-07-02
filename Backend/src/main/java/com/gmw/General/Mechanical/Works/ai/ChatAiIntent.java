package com.gmw.General.Mechanical.Works.ai;

import org.springframework.util.StringUtils;

final class ChatAiIntent {

	static final String WELCOME_MESSAGE = """
			Hello! Welcome to General Mechanical Works.

			How can I help you today? Would you like to:
			• Book a workshop service (repair, wash, tyre, engine, and more)
			• Browse or buy a product from our shop

			Just tell me what you need and I'll guide you.""";

	private ChatAiIntent() {
	}

	static boolean isHelpQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"how can you help", "how can i help", "what can you do", "what do you do",
				"help me", "need help", "can you help", "assist me");
	}

	static boolean isSimpleGreeting(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		if (normalized.length() > 48) {
			return false;
		}
		return normalized.matches(
				"^(hi+|hello+|hey+|hii+|helo+|namaste+|yo+|sup+|good morning|good afternoon|good evening)( there| everyone| sir| ma'am)?[!.?\\s]*$");
	}

	static boolean isProductQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"product", "buy", "purchase", "price", "cost", "part", "parts", "stock",
				"sku", "catalog", "shop", "order", "available", "item", "spare", "accessory");
	}

	static boolean isServiceQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"book", "booking", "appointment", "service", "repair", "fix", "wash",
				"tyre", "tire", "engine", "schedule", "slot", "workshop", "maintain",
				"maintenance", "pickup", "dent", "paint", "battery", "chain");
	}

	private static String normalize(String text) {
		return text.trim()
				.toLowerCase()
				.replaceAll("[!.?,]+", " ")
				.replaceAll("\\s+", " ")
				.trim();
	}

	private static boolean containsAny(String haystack, String... needles) {
		for (String needle : needles) {
			if (haystack.contains(needle)) {
				return true;
			}
		}
		return false;
	}
}
