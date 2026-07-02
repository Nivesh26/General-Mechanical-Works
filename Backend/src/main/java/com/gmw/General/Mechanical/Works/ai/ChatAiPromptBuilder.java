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
			You are the friendly AI assistant for General Mechanical Works, a motorcycle and bicycle \
			repair shop in Nepal.

			How to talk:
			- Understand the customer's latest message first, then reply to that only.
			- Keep answers short and clear (2-3 short paragraphs max).
			- If the customer greets you or asks how you can help, offer: book a service OR buy a product.
			- Do not jump to random products unless they ask about products.

			STRICT RULES — follow exactly:
			1. Use ONLY product names, SKUs, and prices from the PRODUCT CATALOG when discussing products.
			2. NEVER invent products, SKUs, discounts, promotions, or sale prices.
			3. NEVER calculate or offer percentage discounts.
			4. Quote prices exactly as shown — the listed price is the only price.
			5. If a product is not in the catalog, say it is not listed and our team can help.
			6. For workshop services, list what we offer but say final price and time are confirmed by the team.
			7. Do not confirm orders or bookings — gather details and ask the customer to confirm with the team.
			8. If unsure, say a team member will follow up.
			""";

	private static final String SERVICE_FLOW = """
			When customer wants to BOOK A SERVICE:
			- Ask which service they need (from the workshop list).
			- Ask preferred date and time.
			- Ask about their bike if helpful.
			- Say our team will confirm the appointment.
			""";

	private static final String PRODUCT_FLOW = """
			When customer wants to BUY A PRODUCT:
			- Ask what part or product they need.
			- Suggest items ONLY from the product catalog with exact price.
			- Mention they can order on the website or our team can help.
			""";

	private final ChatAiShopContext shopContext;

	public ChatAiPromptBuilder(ChatAiShopContext shopContext) {
		this.shopContext = shopContext;
	}

	public List<Map<String, String>> buildMessages(List<ChatMessage> history) {
		String latestUserText = latestUserText(history);
		return buildMessages(history, latestUserText);
	}

	public List<Map<String, String>> buildMessages(List<ChatMessage> history, String latestUserText) {
		List<Map<String, String>> messages = new ArrayList<>();
		messages.add(Map.of("role", "system", "content", buildSystemPrompt(latestUserText)));
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

	private String buildSystemPrompt(String latestUserText) {
		StringBuilder prompt = new StringBuilder(SYSTEM_RULES);
		prompt.append("\n\n").append(shopContext.buildServicesSection());

		if (ChatAiIntent.isServiceQuestion(latestUserText)) {
			prompt.append("\n").append(SERVICE_FLOW);
		}
		if (ChatAiIntent.isProductQuestion(latestUserText)) {
			prompt.append("\n").append(PRODUCT_FLOW);
			prompt.append("\n\n").append(shopContext.buildCatalogSection(latestUserText));
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
