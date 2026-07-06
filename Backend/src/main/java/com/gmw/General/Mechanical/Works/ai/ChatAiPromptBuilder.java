package com.gmw.General.Mechanical.Works.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.ChatAttachmentType;
import com.gmw.General.Mechanical.Works.chat.ChatMessage;
import com.gmw.General.Mechanical.Works.chat.ChatSender;

@Component
public class ChatAiPromptBuilder {

	private static final String SYSTEM_RULES = """
			You are the AI assistant for General Mechanical Works website and workshop.

			How to reply:
			- Read the customer's latest message and answer THAT question first.
			- Use the PROJECT KNOWLEDGE and CUSTOMER sections below — they describe this exact website.
			- Keep answers short, friendly, and accurate (2-4 short paragraphs max).
			- Point customers to the correct page (/products, /services, /ordertracking, etc.) when helpful.

			STRICT RULES:
			1. Use ONLY facts from the sections below. Never invent products, prices, pages, or payment methods.
			2. Product prices: ONLY from PRODUCT CATALOG when discussing products.
			3. Payments: ONLY COD, eSewa, Khalti for online orders.
			4. Do not confirm orders or bookings in chat — guide them to the website or team.
			5. If information is missing, say our team will follow up. Do not guess.
			6. NEVER claim items were added to cart and NEVER invent cart contents.
			""";

	private static final String SERVICE_FLOW = """
			BOOKING HELP: Direct customer to /services. Explain workshop vs pickup. \
			They need login, saved vehicle, date, and time slot.""";

	private static final String PRODUCT_FLOW = """
			SHOPPING HELP: Direct customer to /products → cart → /checkout. \
			When recommending a product, include its Link from the catalog as a clickable URL.""";

	private static final String ORDER_FLOW = """
			ORDER HELP: Customer can track at /ordertracking. \
			Use their RECENT ORDERS from CUSTOMER section if asked about their order.""";

	private static final String APPOINTMENT_FLOW = """
			APPOINTMENT HELP: Customer can view bookings at /bookings. \
			Use RECENT SERVICE BOOKINGS from CUSTOMER section if asked about their appointment.""";

	private static final String MECHANICAL_ADVICE_FLOW = """
			MECHANICAL GUIDANCE: The customer wants how-to help (DIY or understanding a repair).
			- Give clear, practical step-by-step guidance for motorcycle/bike maintenance when appropriate.
			- Start with safety (engine off, proper tools, disconnect negative terminal first for batteries, etc.).
			- For complex or risky work, recommend booking the matching workshop service at /services (e.g. Battery Service).
			- Do NOT reply that a product is missing from the shop unless they are clearly trying to buy a part.""";

	private final ChatAiKnowledgeBase knowledgeBase;
	private final ChatAiUserContext userContext;
	private final ChatAiShopContext shopContext;

	public ChatAiPromptBuilder(
			ChatAiKnowledgeBase knowledgeBase,
			ChatAiUserContext userContext,
			ChatAiShopContext shopContext) {
		this.knowledgeBase = knowledgeBase;
		this.userContext = userContext;
		this.shopContext = shopContext;
	}

	public List<Map<String, String>> buildMessages(List<ChatMessage> history, Long userId) {
		String latestUserText = latestUserText(history);
		return buildMessages(history, latestUserText, userId);
	}

	public List<Map<String, String>> buildMessages(List<ChatMessage> history, String latestUserText, Long userId) {
		List<Map<String, String>> messages = new ArrayList<>();
		messages.add(Map.of("role", "system", "content", buildSystemPrompt(latestUserText, userId)));
		for (ChatMessage message : history) {
			String role = toOllamaRole(message.getSender());
			if (role == null) {
				continue;
			}
			String content = formatMessageContent(message);
			if (!StringUtils.hasText(content)) {
				continue;
			}
			messages.add(Map.of("role", role, "content", content));
		}
		return messages;
	}

	private String buildSystemPrompt(String latestUserText, Long userId) {
		StringBuilder prompt = new StringBuilder(SYSTEM_RULES);
		prompt.append("\n\n").append(knowledgeBase.buildProjectOverview());
		prompt.append("\n").append(knowledgeBase.buildWorkshopServicesDetail());
		prompt.append("\nLIVE SHOP DATA:\n").append(userContext.buildLiveShopStats());

		String userSection = userContext.buildUserSection(userId);
		if (StringUtils.hasText(userSection)) {
			prompt.append('\n').append(userSection);
		}

		if (ChatAiIntent.isServiceQuestion(latestUserText)) {
			prompt.append("\n").append(SERVICE_FLOW);
		}
		if (ChatAiIntent.isMechanicalAdviceQuestion(latestUserText)) {
			prompt.append("\n").append(MECHANICAL_ADVICE_FLOW);
		}
		if (ChatAiIntent.isProductQuestion(latestUserText)) {
			prompt.append("\n").append(PRODUCT_FLOW);
			prompt.append("\n\n").append(shopContext.buildCatalogSection(latestUserText));
		}
		if (ChatAiIntent.isOrderQuestion(latestUserText)) {
			prompt.append("\n").append(ORDER_FLOW);
		}
		if (ChatAiIntent.isAppointmentStatusQuestion(latestUserText)) {
			prompt.append("\n").append(APPOINTMENT_FLOW);
		}
		return prompt.toString();
	}

	private static String latestUserText(List<ChatMessage> history) {
		for (int i = history.size() - 1; i >= 0; i--) {
			ChatMessage message = history.get(i);
			if (message.getSender() == ChatSender.USER && StringUtils.hasText(message.getBody())) {
				return message.getBody().trim();
			}
		}
		return "";
	}

	private static String toOllamaRole(ChatSender sender) {
		return switch (sender) {
			case USER -> "user";
			case ADMIN, ASSISTANT -> "assistant";
		};
	}

	private static String formatMessageContent(ChatMessage message) {
		StringBuilder builder = new StringBuilder();
		if (StringUtils.hasText(message.getBody())) {
			builder.append(message.getBody().trim());
		}
		if (message.getAttachmentType() == ChatAttachmentType.IMAGE) {
			if (!builder.isEmpty()) {
				builder.append("\n\n");
			}
			builder.append("[Customer attached an image]");
		} else if (message.getAttachmentType() == ChatAttachmentType.PDF) {
			if (!builder.isEmpty()) {
				builder.append("\n\n");
			}
			builder.append("[Customer attached a PDF file]");
		}
		return builder.toString();
	}
}
