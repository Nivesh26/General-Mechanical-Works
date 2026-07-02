package com.gmw.General.Mechanical.Works.ai;

import org.springframework.util.StringUtils;

final class ChatAiIntent {

	static final String WELCOME_MESSAGE = """
			Hello! Welcome to General Mechanical Works.

			How can I help you today? Would you like to:
			• Book a workshop service (repair, wash, tyre, engine, and more)
			• Browse or buy a product from our shop

			Just tell me what you need and I'll guide you.""";

	static final String PAYMENT_MESSAGE = """
			For product orders on our website, you can pay using:
			• Cash on Delivery (COD)
			• eSewa
			• Khalti

			Choose your payment method at checkout when you place an order.

			For workshop services, payment is usually handled at the shop or as agreed with our team. If you need help with a specific order, our staff can assist you.""";

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
		return isProductShoppingQuestion(text);
	}

	static boolean isAddToCartIntent(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		if (containsAny(normalized,
				"add to cart", "add it to cart", "add this to cart", "add that to cart",
				"put in cart", "put it in cart", "add in cart", "add to my cart",
				"yes add", "add it", "add this", "add that", "add one",
				"can you add", "please add", "add a ", "add the ")) {
			return true;
		}
		return normalized.contains("cart") && normalized.contains("add");
	}

	static boolean refersToPreviousProduct(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"this", "that", "same one", "same item", "the one", "add it", "add this", "add that");
	}

	static boolean isProductShoppingQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"product", "buy", "purchase", "price", "cost", "part", "parts", "stock",
				"sku", "catalog", "shop", "order", "available", "item", "spare", "accessory",
				"do you have", "do you sell", "have you got", "got any", "have any", "any ",
				"show me", "looking for", "want to buy", "need a", "need an", "sell ",
				"battery", "batteries", "brake", "tyre", "tire", "oil", "helmet", "chain");
	}

	static boolean isServiceBookingIntent(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"book", "booking", "appointment", "schedule", "pickup", "workshop visit");
	}

	static boolean isServiceQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"book", "booking", "appointment", "service", "repair", "fix", "wash",
				"tyre", "tire", "engine", "schedule", "slot", "workshop", "maintain",
				"maintenance", "pickup", "dent", "paint", "battery service", "chain");
	}

	static boolean isPaymentQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"how to pay", "how do i pay", "how can i pay", "payment method", "payment methods",
				"pay for", "make payment", "esewa", "e sewa", "khalti", "cod",
				"cash on delivery", "online payment", "wallet");
	}

	static boolean isOrderQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"my order", "order status", "track order", "order tracking", "where is my order",
				"delivery status", "shipped", "delivered", "cancel order", "order number");
	}

	static boolean isAppointmentStatusQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		if (isServiceQuestion(text) && !containsAny(normalized, "status", "booking", "appointment", "my")) {
			return false;
		}
		return containsAny(normalized,
				"my booking", "my appointment", "booking status", "appointment status",
				"service status", "when is my service", "accepted", "declined");
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
