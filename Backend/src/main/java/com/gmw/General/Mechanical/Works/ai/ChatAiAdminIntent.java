package com.gmw.General.Mechanical.Works.ai;

import org.springframework.util.StringUtils;

public final class ChatAiAdminIntent {

	public static final String WELCOME_MESSAGE = """
			Hello! I'm your shop operations assistant for General Mechanical Works.

			Ask me about:
			• Today's bookings and appointments
			• Order status and pending orders
			• Upcoming service appointments
			• Products and shop policies

			I use live data from your dashboard — I won't guess numbers or names.""";

	private ChatAiAdminIntent() {
	}

	static boolean isTodayBookingsQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		return containsAny(normalized,
				"today booking", "today's booking", "todays booking", "bookings today",
				"appointment today", "appointments today", "today appointment", "today's appointment",
				"summarize today", "summary today", "schedule today", "today schedule");
	}

	static boolean isAllOrdersDeliveredQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		if (!normalized.contains("order")) {
			return false;
		}
		return containsAny(normalized,
				"all order", "all orders", "every order", "orders delivered", "order delivered",
				"all delivered", "are they delivered", "everything delivered", "fully delivered",
				"still pending", "still shipping", "not delivered", "any order not");
	}

	static boolean isOrdersOverviewQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		if (isAllOrdersDeliveredQuestion(text)) {
			return true;
		}
		if (containsAny(normalized, "track my order", "where is my order", "customer order tracking")) {
			return false;
		}
		return containsAny(normalized,
				"order summary", "summarize order", "orders summary", "pending order",
				"pending orders", "how many order", "shop order", "recent order", "order status",
				"order overview", "total order", "delivered", "shipped", "confirmed order",
				"my order", "our order", "any order");
	}

	static boolean isAppointmentsOverviewQuestion(String text) {
		if (!StringUtils.hasText(text)) {
			return false;
		}
		String normalized = normalize(text);
		if (isTodayBookingsQuestion(text)) {
			return false;
		}
		return containsAny(normalized,
				"appointment summary", "booking summary", "pending appointment", "pending booking",
				"upcoming appointment", "upcoming booking", "service appointment", "service booking",
				"how many booking", "how many appointment", "appointments overview", "bookings overview");
	}

	private static String normalize(String text) {
		return text.trim()
				.toLowerCase()
				.replaceAll("[!.?,']+", " ")
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
