package com.gmw.General.Mechanical.Works.ai;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.ChatMessage;
import com.gmw.General.Mechanical.Works.chat.ChatMessageRepository;
import com.gmw.General.Mechanical.Works.chat.ChatService;
import com.gmw.General.Mechanical.Works.chat.ChatAttachmentType;
import com.gmw.General.Mechanical.Works.chat.ChatSender;

@Service
public class ChatAiService {

	private static final Logger log = LoggerFactory.getLogger(ChatAiService.class);
	private static final int MAX_HISTORY_MESSAGES = 20;
	private static final String FALLBACK_REPLY =
			"Sorry, I'm having trouble responding right now. A team member will help you shortly.";

	private final ChatService chatService;
	private final ChatMessageRepository chatMessageRepository;
	private final OllamaClient ollamaClient;
	private final ChatAiPromptBuilder promptBuilder;
	private final ChatAiProductReplyBuilder productReplyBuilder;
	private final ChatAiCustomizationReplyBuilder customizationReplyBuilder;
	private final ChatAiCartAction cartAction;

	public ChatAiService(
			@Lazy ChatService chatService,
			ChatMessageRepository chatMessageRepository,
			OllamaClient ollamaClient,
			ChatAiPromptBuilder promptBuilder,
			ChatAiProductReplyBuilder productReplyBuilder,
			ChatAiCustomizationReplyBuilder customizationReplyBuilder,
			ChatAiCartAction cartAction) {
		this.chatService = chatService;
		this.chatMessageRepository = chatMessageRepository;
		this.ollamaClient = ollamaClient;
		this.promptBuilder = promptBuilder;
		this.productReplyBuilder = productReplyBuilder;
		this.customizationReplyBuilder = customizationReplyBuilder;
		this.cartAction = cartAction;
	}

	@Async("chatAiTaskExecutor")
	public void maybeReplyAsync(Long userId) {
		if (userId == null) {
			return;
		}
		if (!chatService.isAiEnabledForUser(userId)) {
			return;
		}
		long replyStartedAt = System.currentTimeMillis();
		try {
			List<ChatMessage> history = recentHistory(userId);
			if (history.isEmpty()) {
				return;
			}
			ChatMessage latest = history.get(history.size() - 1);
			if (latest.getSender() != ChatSender.USER) {
				return;
			}
			if (!chatService.isAiEnabledForUser(userId)) {
				return;
			}
			String userText = StringUtils.hasText(latest.getBody()) ? latest.getBody().trim() : "";
			boolean hasUserImage = latest.getAttachmentType() == ChatAttachmentType.IMAGE
					&& StringUtils.hasText(latest.getAttachmentUrl());
			boolean hasUserPdf = latest.getAttachmentType() == ChatAttachmentType.PDF;

			if (hasUserPdf) {
				sendTextReply(userId, replyStartedAt,
						"I can analyze photos of your bike or parts. PDF files are reviewed by our team — "
								+ "please describe your question in text or send a photo if you can.");
				return;
			}
			if (hasUserImage && ChatAiIntent.isBikeDamageOrDiagnosisQuestion(userText)) {
				try {
					String reply = ollamaClient.chat(promptBuilder.buildMessages(history, userText, userId));
					if (!StringUtils.hasText(reply)) {
						reply = damageAnalysisFallbackReply();
					}
					sendTextReply(userId, replyStartedAt, reply);
				} catch (Exception visionEx) {
					log.warn("Vision analysis failed for user {}: {}", userId, visionEx.getMessage());
					sendTextReply(userId, replyStartedAt, damageAnalysisFallbackReply());
				}
				return;
			}
			Optional<ChatAiReply> customizationReply =
					customizationReplyBuilder.tryBuildReply(userText, latest.getAttachmentUrl());
			if (customizationReply.isPresent()) {
				sendAssistantReply(userId, replyStartedAt, customizationReply.get());
				return;
			}
			if (hasUserImage && !promptBuilder.canAnalyzeLatestImage(history)) {
				sendTextReply(userId, replyStartedAt,
						"I couldn't open that photo. Please try sending it again, or describe the issue in text.");
				return;
			}
			if (!hasUserImage) {
				if (ChatAiIntent.isSimpleGreeting(userText) || ChatAiIntent.isHelpQuestion(userText)) {
					sendTextReply(userId, replyStartedAt, ChatAiIntent.WELCOME_MESSAGE);
					return;
				}
				if (ChatAiIntent.isPaymentQuestion(userText)) {
					sendTextReply(userId, replyStartedAt, ChatAiIntent.PAYMENT_MESSAGE);
					return;
				}
				Optional<ChatAiReply> cartReply = cartAction.tryAddToCart(userId, userText, history);
				if (cartReply.isPresent()) {
					sendAssistantReply(userId, replyStartedAt, cartReply.get());
					return;
				}
				Optional<ChatAiReply> productReply = productReplyBuilder.tryBuildReply(userText);
				if (productReply.isPresent()) {
					sendAssistantReply(userId, replyStartedAt, productReply.get());
					return;
				}
				if (ChatAiIntent.isAddToCartIntent(userText)) {
					sendTextReply(userId, replyStartedAt,
							"I couldn't tell which product to add. Please say the product name or SKU, for example: add BCN-001 to cart.");
					return;
				}
			}
			if (hasUserImage && ChatAiIntent.isBikeCustomizationQuestion(userText)
					&& ChatAiColorParser.extractTargetColor(userText).isEmpty()) {
				sendTextReply(userId, replyStartedAt, paintBookingPrompt(userText));
				return;
			}
			String reply = ollamaClient.chat(promptBuilder.buildMessages(history, userText, userId));
			if (!StringUtils.hasText(reply)) {
				reply = FALLBACK_REPLY;
			}
			sendTextReply(userId, replyStartedAt, reply);
		} catch (Exception ex) {
			log.warn("AI reply failed for user {}: {}", userId, ex.getMessage());
			try {
				if (chatService.isAiEnabledForUser(userId)) {
					ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
					chatService.sendFromAssistant(userId, FALLBACK_REPLY);
				}
			} catch (Exception sendEx) {
				log.warn("Could not send AI fallback for user {}: {}", userId, sendEx.getMessage());
			}
		}
	}

	private void sendTextReply(Long userId, long replyStartedAt, String text) {
		ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
		chatService.sendFromAssistant(userId, text);
	}

	private void sendAssistantReply(Long userId, long replyStartedAt, ChatAiReply reply) {
		ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
		chatService.sendFromAssistant(userId, reply.text(), reply.attachmentUrl(), reply.attachmentName());
	}

	private static String paintBookingPrompt(String userText) {
		if (ChatAiColorParser.extractTargetColor(userText).isEmpty()) {
			return """
					Tell me which color you want (for example: red, matte black, or blue) and I can generate a preview.

					For professional paint work, book Dent & painting at /services — our team in Pulchowk will quote based on your bike."""
					.trim();
		}
		return """
				I'll generate a color preview when possible. For the real paint job, book Dent & painting at /services.

				Our workshop handles prep, color coats, and clear coat — mention your color in the booking notes."""
				.trim();
	}

	private static String damageAnalysisFallbackReply() {
		return """
				Thanks for sharing the photo. I couldn't analyze it automatically right now, but our workshop team can inspect the damage in person.

				Please book a service at /services — choose Engine Repair or Dent & painting depending on the damage. For accidents, avoid riding until a mechanic checks brakes, forks, and the frame.

				Our team at General Mechanical Works, Pulchowk can help you get back on the road safely."""
				.trim();
	}

	private List<ChatMessage> recentHistory(Long userId) {
		List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
		if (messages.size() <= MAX_HISTORY_MESSAGES) {
			return messages;
		}
		return messages.subList(messages.size() - MAX_HISTORY_MESSAGES, messages.size());
	}
}
