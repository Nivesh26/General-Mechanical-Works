package com.gmw.General.Mechanical.Works.ai;

import java.util.List;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.AdminAssistantChatService;
import com.gmw.General.Mechanical.Works.chat.AdminAssistantMessage;
import com.gmw.General.Mechanical.Works.chat.AdminAssistantMessageRepository;
import com.gmw.General.Mechanical.Works.chat.ChatAttachmentType;
import com.gmw.General.Mechanical.Works.chat.ChatSender;

@Service
public class ChatAiAdminService {

	private static final Logger log = LoggerFactory.getLogger(ChatAiAdminService.class);
	private static final int MAX_HISTORY_MESSAGES = 20;
	private static final String FALLBACK_REPLY =
			"Sorry, I'm having trouble responding right now. Please try again or check the admin dashboard directly.";

	private final AdminAssistantChatService adminAssistantChatService;
	private final AdminAssistantMessageRepository adminAssistantMessageRepository;
	private final OllamaClient ollamaClient;
	private final ChatAiAdminPromptBuilder promptBuilder;
	private final ChatAiAdminContext adminContext;
	private final ChatAiCustomizationReplyBuilder customizationReplyBuilder;

	public ChatAiAdminService(
			@Lazy AdminAssistantChatService adminAssistantChatService,
			AdminAssistantMessageRepository adminAssistantMessageRepository,
			OllamaClient ollamaClient,
			ChatAiAdminPromptBuilder promptBuilder,
			ChatAiAdminContext adminContext,
			ChatAiCustomizationReplyBuilder customizationReplyBuilder) {
		this.adminAssistantChatService = adminAssistantChatService;
		this.adminAssistantMessageRepository = adminAssistantMessageRepository;
		this.ollamaClient = ollamaClient;
		this.promptBuilder = promptBuilder;
		this.adminContext = adminContext;
		this.customizationReplyBuilder = customizationReplyBuilder;
	}

	@Async("chatAiTaskExecutor")
	public void maybeReplyAsync(Long adminId) {
		if (adminId == null) {
			return;
		}
		long replyStartedAt = System.currentTimeMillis();
		try {
			List<AdminAssistantMessage> history = recentHistory(adminId);
			if (history.isEmpty()) {
				return;
			}
			AdminAssistantMessage latest = history.get(history.size() - 1);
			if (latest.getSender() != ChatSender.ADMIN) {
				return;
			}
			String adminText = StringUtils.hasText(latest.getBody()) ? latest.getBody().trim() : "";
			boolean hasAdminImage = latest.getAttachmentType() == ChatAttachmentType.IMAGE
					&& StringUtils.hasText(latest.getAttachmentUrl());
			boolean hasAdminPdf = latest.getAttachmentType() == ChatAttachmentType.PDF;

			if (hasAdminPdf) {
				sendTextReply(adminId, replyStartedAt,
						"I can analyze photos of bikes or parts. PDF files need manual review — send a photo if you can.");
				return;
			}
			if (hasAdminImage && ChatAiIntent.isBikeDamageOrDiagnosisQuestion(adminText)) {
				try {
					String reply = ollamaClient.chat(promptBuilder.buildMessages(history, adminText));
					if (!StringUtils.hasText(reply)) {
						reply = damageAnalysisFallbackReply();
					}
					sendTextReply(adminId, replyStartedAt, reply);
				} catch (Exception visionEx) {
					log.warn("Admin vision analysis failed for admin {}: {}", adminId, visionEx.getMessage());
					sendTextReply(adminId, replyStartedAt, damageAnalysisFallbackReply());
				}
				return;
			}
			Optional<ChatAiReply> customizationReply =
					customizationReplyBuilder.tryBuildAdminReply(adminText, latest.getAttachmentUrl());
			if (customizationReply.isPresent()) {
				sendAssistantReply(adminId, replyStartedAt, customizationReply.get());
				return;
			}
			if (hasAdminImage && !promptBuilder.canAnalyzeLatestImage(history)) {
				sendTextReply(adminId, replyStartedAt,
						"I couldn't open that photo. Please try sending it again, or describe the issue in text.");
				return;
			}
			if (!hasAdminImage) {
				if (ChatAiIntent.isSimpleGreeting(adminText) || ChatAiIntent.isHelpQuestion(adminText)) {
					sendAssistantMessage(adminId, replyStartedAt, ChatAiAdminIntent.WELCOME_MESSAGE);
					return;
				}
				if (ChatAiAdminIntent.isTodayBookingsQuestion(adminText)) {
					sendAssistantMessage(adminId, replyStartedAt, adminContext.buildTodayBookingsReply());
					return;
				}
				if (ChatAiAdminIntent.isAllOrdersDeliveredQuestion(adminText)) {
					sendAssistantMessage(adminId, replyStartedAt, adminContext.buildAllOrdersDeliveredReply());
					return;
				}
				if (ChatAiAdminIntent.isOrdersOverviewQuestion(adminText)) {
					sendAssistantMessage(adminId, replyStartedAt, adminContext.buildOrdersSummaryReply());
					return;
				}
				if (ChatAiAdminIntent.isAppointmentsOverviewQuestion(adminText)) {
					sendAssistantMessage(adminId, replyStartedAt, adminContext.buildAppointmentsSummaryReply());
					return;
				}
			}
			if (hasAdminImage && ChatAiIntent.isBikeCustomizationQuestion(adminText)
					&& ChatAiColorParser.extractTargetColor(adminText).isEmpty()) {
				sendTextReply(adminId, replyStartedAt, adminPaintPrompt());
				return;
			}
			String reply = ollamaClient.chat(promptBuilder.buildMessages(history, adminText));
			if (!StringUtils.hasText(reply)) {
				reply = FALLBACK_REPLY;
			}
			sendAssistantMessage(adminId, replyStartedAt, reply);
		} catch (Exception ex) {
			log.warn("Admin AI reply failed for admin {}: {}", adminId, ex.getMessage());
			try {
				ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
				adminAssistantChatService.sendAssistantMessage(adminId, FALLBACK_REPLY);
			} catch (Exception sendEx) {
				log.warn("Could not send admin AI fallback for admin {}: {}", adminId, sendEx.getMessage());
			}
		}
	}

	private void sendTextReply(Long adminId, long replyStartedAt, String text) {
		ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
		adminAssistantChatService.sendAssistantMessage(adminId, text);
	}

	private void sendAssistantMessage(Long adminId, long replyStartedAt, String text) {
		ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
		adminAssistantChatService.sendAssistantMessage(adminId, text);
	}

	private void sendAssistantReply(Long adminId, long replyStartedAt, ChatAiReply reply) {
		ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
		adminAssistantChatService.sendAssistantMessage(
				adminId, reply.text(), reply.attachmentUrl(), reply.attachmentName());
	}

	private static String adminPaintPrompt() {
		return """
				Tell me which color to preview (for example: red, matte black, or blue) and I can generate a customer quote image.

				Customers book Dent & painting at /services — check Appointments in the admin panel for requests."""
				.trim();
	}

	private static String damageAnalysisFallbackReply() {
		return """
				I couldn't analyze that photo automatically. Inspect the bike in the workshop and check Appointments for related service requests.

				For accidents, note fork, frame, brake, and fairing damage before quoting — Engine Repair or Dent & painting may apply."""
				.trim();
	}

	private List<AdminAssistantMessage> recentHistory(Long adminId) {
		List<AdminAssistantMessage> messages =
				adminAssistantMessageRepository.findByAdminIdOrderByCreatedAtAsc(adminId);
		if (messages.size() <= MAX_HISTORY_MESSAGES) {
			return messages;
		}
		return messages.subList(messages.size() - MAX_HISTORY_MESSAGES, messages.size());
	}
}
