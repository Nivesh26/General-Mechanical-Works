package com.gmw.General.Mechanical.Works.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.AdminAssistantMessage;
import com.gmw.General.Mechanical.Works.chat.ChatAttachmentType;
import com.gmw.General.Mechanical.Works.chat.ChatSender;

@Component
public class ChatAiAdminPromptBuilder {

	private static final String DEFAULT_IMAGE_PROMPT = """
			The admin sent a photo of a motorcycle or bike. \
			Look at the photo and answer their question — this is a real bike, not a file to edit.""";

	private static final String VISION_SYSTEM_RULES = """
			You are the internal AI assistant for General Mechanical Works admin staff.

			The admin attached a PHOTO. You CAN see the image.
			- Answer their question about the bike or damage shown.
			- NEVER say you cannot modify or edit images — they want analysis, not photo editing.
			- Speak to the admin directly (not as if talking to a customer).
			- Keep answers concise and actionable for shop staff.
			""";

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

	private static final String IMAGE_VISION_FLOW = """
			PHOTO ANALYSIS:
			- Describe visible damage, wear, parts, leaks, tyres, or condition.
			- Suggest which workshop services apply (Engine Repair, Dent & painting, etc.).
			- Help the admin advise customers or prepare quotes.""";

	private static final String DAMAGE_ANALYSIS_FLOW = """
			CRASH / DAMAGE ANALYSIS:
			- Describe visible damage (fairing, forks, handlebar, frame, leaks, etc.).
			- Do NOT discuss paint color unless the admin explicitly asked for a color change.
			- Note safety concerns and recommend appropriate repair services.
			- Help the admin respond to the customer or plan workshop work.""";

	private static final String BIKE_CUSTOMIZATION_FLOW = """
			PAINT / COLOR PREVIEW:
			- The admin wants a color-change preview for a customer quote.
			- Mention what you see in the photo and the target color if given.
			- Remind them customers book Dent & painting at /services.""";

	private final ChatAiKnowledgeBase knowledgeBase;
	private final ChatAiAdminContext adminContext;
	private final ChatAiShopContext shopContext;
	private final ChatAiImageLoader imageLoader;

	public ChatAiAdminPromptBuilder(
			ChatAiKnowledgeBase knowledgeBase,
			ChatAiAdminContext adminContext,
			ChatAiShopContext shopContext,
			ChatAiImageLoader imageLoader) {
		this.knowledgeBase = knowledgeBase;
		this.adminContext = adminContext;
		this.shopContext = shopContext;
		this.imageLoader = imageLoader;
	}

	public List<OllamaChatMessage> buildMessages(List<AdminAssistantMessage> history, String latestAdminText) {
		AdminAssistantMessage latestAdminMessage = latestAdminMessage(history);
		boolean latestHasImage = hasImageAttachment(latestAdminMessage);
		Optional<String> latestImageBase64 = latestHasImage
				? imageLoader.loadBase64(latestAdminMessage.getAttachmentUrl())
				: Optional.empty();

		List<OllamaChatMessage> messages = new ArrayList<>();
		messages.add(OllamaChatMessage.of("system", buildSystemPrompt(latestAdminText, latestHasImage)));
		for (AdminAssistantMessage message : history) {
			String role = toOllamaRole(message.getSender());
			if (role == null) {
				continue;
			}
			boolean isLatestAdminImage = latestHasImage && message == latestAdminMessage;
			String content = formatMessageContent(message, isLatestAdminImage && latestImageBase64.isPresent());
			if (!StringUtils.hasText(content) && !isLatestAdminImage) {
				continue;
			}
			if (isLatestAdminImage && latestImageBase64.isPresent()) {
				messages.add(OllamaChatMessage.withImages(role, content, List.of(latestImageBase64.get())));
			} else {
				messages.add(OllamaChatMessage.of(role, content));
			}
		}
		return messages;
	}

	public boolean canAnalyzeLatestImage(List<AdminAssistantMessage> history) {
		AdminAssistantMessage latest = latestAdminMessage(history);
		if (!hasImageAttachment(latest)) {
			return false;
		}
		return imageLoader.loadBase64(latest.getAttachmentUrl()).isPresent();
	}

	private String buildSystemPrompt(String latestAdminText, boolean latestHasImage) {
		StringBuilder prompt = new StringBuilder(latestHasImage ? VISION_SYSTEM_RULES : SYSTEM_RULES);
		prompt.append("\n\n").append(knowledgeBase.buildProjectOverview());
		prompt.append("\n").append(adminContext.buildLiveShopDataSection());
		if (latestHasImage) {
			prompt.append("\n").append(IMAGE_VISION_FLOW);
		}
		if (ChatAiIntent.isBikeDamageOrDiagnosisQuestion(latestAdminText)) {
			prompt.append("\n").append(DAMAGE_ANALYSIS_FLOW);
		}
		if (ChatAiIntent.isBikeCustomizationQuestion(latestAdminText)) {
			prompt.append("\n").append(BIKE_CUSTOMIZATION_FLOW);
		}
		if (ChatAiAdminIntent.isOrdersOverviewQuestion(latestAdminText)
				|| ChatAiAdminIntent.isAllOrdersDeliveredQuestion(latestAdminText)) {
			prompt.append("\n\nORDER DATA NOTE: Use order counts and recent orders from LIVE SHOP DATA above. ")
					.append("Cancelled orders are excluded when answering whether all orders are delivered.");
		}
		if (!latestHasImage && ChatAiIntent.isProductQuestion(latestAdminText)) {
			prompt.append("\n\n").append(shopContext.buildCatalogSection(latestAdminText));
		}
		return prompt.toString();
	}

	private static AdminAssistantMessage latestAdminMessage(List<AdminAssistantMessage> history) {
		for (int i = history.size() - 1; i >= 0; i--) {
			AdminAssistantMessage message = history.get(i);
			if (message.getSender() == ChatSender.ADMIN) {
				return message;
			}
		}
		return null;
	}

	private static boolean hasImageAttachment(AdminAssistantMessage message) {
		return message != null
				&& message.getAttachmentType() == ChatAttachmentType.IMAGE
				&& StringUtils.hasText(message.getAttachmentUrl());
	}

	private static String toOllamaRole(ChatSender sender) {
		return switch (sender) {
			case ADMIN -> "user";
			case ASSISTANT -> "assistant";
			case USER -> null;
		};
	}

	private static String formatMessageContent(AdminAssistantMessage message, boolean imageAttachedForVision) {
		StringBuilder builder = new StringBuilder();
		if (StringUtils.hasText(message.getBody())) {
			builder.append(message.getBody().trim());
		} else if (message.getAttachmentType() == ChatAttachmentType.IMAGE) {
			builder.append(DEFAULT_IMAGE_PROMPT);
		}
		if (!imageAttachedForVision && message.getAttachmentType() == ChatAttachmentType.IMAGE) {
			if (!builder.isEmpty()) {
				builder.append("\n\n");
			}
			builder.append("[Admin attached an image]");
		} else if (message.getAttachmentType() == ChatAttachmentType.PDF) {
			if (!builder.isEmpty()) {
				builder.append("\n\n");
			}
			builder.append("[Admin attached a PDF file]");
		}
		return builder.toString();
	}
}
