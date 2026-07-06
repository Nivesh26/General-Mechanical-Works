package com.gmw.General.Mechanical.Works.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.ChatAttachmentType;
import com.gmw.General.Mechanical.Works.chat.ChatMessage;
import com.gmw.General.Mechanical.Works.chat.ChatSender;

@Component
public class ChatAiPromptBuilder {

	private static final String DEFAULT_IMAGE_PROMPT = """
			The customer sent a photo of their motorcycle or bike. \
			Look at the photo and answer their question about this real bike — not about editing the image file.""";

	private static final String VISION_SYSTEM_RULES = """
			You are the AI assistant for General Mechanical Works (GMW) — a motorcycle workshop and parts shop in Nepal.

			The customer attached a PHOTO of their real bike. You CAN see the image.
			- Answer their question about the bike shown in the photo.
			- NEVER say you cannot modify, edit, or change images — they are NOT asking for photo editing.
			- NEVER claim the bike is a product from our online shop catalog unless they are clearly shopping for a listed part.
			- You may describe brand, color, and condition based only on what you see — do not invent model names or catalog matches.
			- For paint, color change, dents, or modifications: recommend booking at /services.
			- Keep answers short, friendly, and practical (2-4 short paragraphs max).
			""";

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

	private static final String IMAGE_VISION_FLOW = """
			PHOTO ANALYSIS:
			- Describe visible details: color, scratches, dents, rust, tyres, chain, leaks, or damage.
			- Give practical advice and safety notes.
			- Suggest the matching workshop service at /services when professional work is needed.
			- Do not invent product prices or catalog listings.""";

	private static final String DAMAGE_ANALYSIS_FLOW = """
			CRASH / DAMAGE ANALYSIS: The customer sent a photo after an accident or damage.
			- Describe visible damage you see (fairing, forks, handlebar, leaks, tyres, frame, etc.).
			- Do NOT talk about changing paint color unless they explicitly asked for a color change.
			- Recommend safety first — do not ride if forks, brakes, or frame may be damaged.
			- Suggest booking Engine Repair, Dent & painting, or Service Work at /services as appropriate.
			- Be empathetic and practical.""";

	private static final String BIKE_CUSTOMIZATION_FLOW = """
			PAINT / COLOR / MODIFY REQUEST:
			- The customer wants to change their bike's look (paint, color, body work, or modifications).
			- Briefly mention what you see in their photo (current color/condition).
			- Book "Dent & painting" for paint and color changes, or "Modify bike" for custom mods.
			- Guide them to /services — choose workshop visit or pickup, pick date and vehicle.
			- Our team will inspect the bike and quote based on the finish they want.
			- Be encouraging — GMW has done this for 70+ years. Do NOT refuse or say you cannot help.""";

	private final ChatAiKnowledgeBase knowledgeBase;
	private final ChatAiUserContext userContext;
	private final ChatAiShopContext shopContext;
	private final ChatAiImageLoader imageLoader;

	public ChatAiPromptBuilder(
			ChatAiKnowledgeBase knowledgeBase,
			ChatAiUserContext userContext,
			ChatAiShopContext shopContext,
			ChatAiImageLoader imageLoader) {
		this.knowledgeBase = knowledgeBase;
		this.userContext = userContext;
		this.shopContext = shopContext;
		this.imageLoader = imageLoader;
	}

	public List<OllamaChatMessage> buildMessages(List<ChatMessage> history, Long userId) {
		String latestUserText = latestUserText(history);
		return buildMessages(history, latestUserText, userId);
	}

	public List<OllamaChatMessage> buildMessages(List<ChatMessage> history, String latestUserText, Long userId) {
		ChatMessage latestUserMessage = latestUserMessage(history);
		boolean latestHasImage = hasImageAttachment(latestUserMessage);
		Optional<String> latestImageBase64 = latestHasImage
				? imageLoader.loadBase64(latestUserMessage.getAttachmentUrl())
				: Optional.empty();

		List<OllamaChatMessage> messages = new ArrayList<>();
		messages.add(OllamaChatMessage.of("system", buildSystemPrompt(latestUserText, userId, latestHasImage)));
		for (ChatMessage message : history) {
			String role = toOllamaRole(message.getSender());
			if (role == null) {
				continue;
			}
			boolean isLatestUserImage = latestHasImage && message == latestUserMessage;
			String content = formatMessageContent(message, isLatestUserImage && latestImageBase64.isPresent());
			if (!StringUtils.hasText(content) && !isLatestUserImage) {
				continue;
			}
			if (isLatestUserImage && latestImageBase64.isPresent()) {
				messages.add(OllamaChatMessage.withImages(role, content, List.of(latestImageBase64.get())));
			} else {
				messages.add(OllamaChatMessage.of(role, content));
			}
		}
		return messages;
	}

	public boolean canAnalyzeLatestImage(List<ChatMessage> history) {
		ChatMessage latestUserMessage = latestUserMessage(history);
		if (!hasImageAttachment(latestUserMessage)) {
			return false;
		}
		return imageLoader.loadBase64(latestUserMessage.getAttachmentUrl()).isPresent();
	}

	private String buildSystemPrompt(String latestUserText, Long userId, boolean latestHasImage) {
		StringBuilder prompt = new StringBuilder(latestHasImage ? VISION_SYSTEM_RULES : SYSTEM_RULES);
		prompt.append("\n\n").append(knowledgeBase.buildProjectOverview());
		prompt.append("\n").append(knowledgeBase.buildWorkshopServicesDetail());
		if (!latestHasImage) {
			prompt.append("\nLIVE SHOP DATA:\n").append(userContext.buildLiveShopStats());
			String userSection = userContext.buildUserSection(userId);
			if (StringUtils.hasText(userSection)) {
				prompt.append('\n').append(userSection);
			}
		}

		if (latestHasImage) {
			prompt.append("\n").append(IMAGE_VISION_FLOW);
		}
		if (ChatAiIntent.isBikeDamageOrDiagnosisQuestion(latestUserText)) {
			prompt.append("\n").append(DAMAGE_ANALYSIS_FLOW);
		}
		if (ChatAiIntent.isBikeCustomizationQuestion(latestUserText)) {
			prompt.append("\n").append(BIKE_CUSTOMIZATION_FLOW);
		}
		if (ChatAiIntent.isServiceQuestion(latestUserText)) {
			prompt.append("\n").append(SERVICE_FLOW);
		}
		if (ChatAiIntent.isMechanicalAdviceQuestion(latestUserText)) {
			prompt.append("\n").append(MECHANICAL_ADVICE_FLOW);
		}
		if (!latestHasImage && ChatAiIntent.isProductQuestion(latestUserText)) {
			prompt.append("\n").append(PRODUCT_FLOW);
			prompt.append("\n\n").append(shopContext.buildCatalogSection(latestUserText));
		}
		if (!latestHasImage && ChatAiIntent.isOrderQuestion(latestUserText)) {
			prompt.append("\n").append(ORDER_FLOW);
		}
		if (!latestHasImage && ChatAiIntent.isAppointmentStatusQuestion(latestUserText)) {
			prompt.append("\n").append(APPOINTMENT_FLOW);
		}
		return prompt.toString();
	}

	private static ChatMessage latestUserMessage(List<ChatMessage> history) {
		for (int i = history.size() - 1; i >= 0; i--) {
			ChatMessage message = history.get(i);
			if (message.getSender() == ChatSender.USER) {
				return message;
			}
		}
		return null;
	}

	private static boolean hasImageAttachment(ChatMessage message) {
		return message != null
				&& message.getAttachmentType() == ChatAttachmentType.IMAGE
				&& StringUtils.hasText(message.getAttachmentUrl());
	}

	private static String latestUserText(List<ChatMessage> history) {
		ChatMessage latest = latestUserMessage(history);
		if (latest == null || !StringUtils.hasText(latest.getBody())) {
			return "";
		}
		return latest.getBody().trim();
	}

	private static String toOllamaRole(ChatSender sender) {
		return switch (sender) {
			case USER -> "user";
			case ADMIN, ASSISTANT -> "assistant";
		};
	}

	private static String formatMessageContent(ChatMessage message, boolean imageAttachedForVision) {
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
