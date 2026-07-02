package com.gmw.General.Mechanical.Works.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.AdminAssistantMessage;
import com.gmw.General.Mechanical.Works.chat.ChatSender;

@Component
public class ChatAiAdminPromptBuilder {

	private static final String SYSTEM_RULES = """
			You are the internal AI assistant for General Mechanical Works admin staff.

			How to help:
			- Answer the admin's latest question about shop operations: orders, bookings/appointments, products, and customers.
			- Use ONLY facts from LIVE SHOP DATA and PROJECT KNOWLEDGE below.
			- Keep answers concise and actionable (2-4 short paragraphs or bullet lists).
			- Point admins to Admin pages when useful: Dashboard, Orders, Appointments, Messages, Products.

			STRICT RULES:
			1. Never invent order numbers, booking counts, customer names, or statuses.
			2. If data is missing, say it is not in the live data and suggest checking the admin panel.
			3. You assist admins — do not speak as if you are talking to a customer.
			4. Do not confirm actions you cannot perform (accept booking, ship order). Guide the admin to the right page.
			""";

	private final ChatAiKnowledgeBase knowledgeBase;
	private final ChatAiAdminContext adminContext;
	private final ChatAiShopContext shopContext;

	public ChatAiAdminPromptBuilder(
			ChatAiKnowledgeBase knowledgeBase,
			ChatAiAdminContext adminContext,
			ChatAiShopContext shopContext) {
		this.knowledgeBase = knowledgeBase;
		this.adminContext = adminContext;
		this.shopContext = shopContext;
	}

	public List<Map<String, String>> buildMessages(List<AdminAssistantMessage> history, String latestAdminText) {
		List<Map<String, String>> messages = new ArrayList<>();
		messages.add(Map.of("role", "system", "content", buildSystemPrompt(latestAdminText)));
		for (AdminAssistantMessage message : history) {
			String role = toOllamaRole(message.getSender());
			if (role == null || !StringUtils.hasText(message.getBody())) {
				continue;
			}
			messages.add(Map.of("role", role, "content", message.getBody().trim()));
		}
		return messages;
	}

	private String buildSystemPrompt(String latestAdminText) {
		StringBuilder prompt = new StringBuilder(SYSTEM_RULES);
		prompt.append("\n\n").append(knowledgeBase.buildProjectOverview());
		prompt.append("\n").append(adminContext.buildLiveShopDataSection());
		if (ChatAiIntent.isProductQuestion(latestAdminText)) {
			prompt.append("\n\n").append(shopContext.buildCatalogSection(latestAdminText));
		}
		return prompt.toString();
	}

	private static String toOllamaRole(ChatSender sender) {
		return switch (sender) {
			case ADMIN -> "user";
			case ASSISTANT -> "assistant";
			case USER -> null;
		};
	}
}
