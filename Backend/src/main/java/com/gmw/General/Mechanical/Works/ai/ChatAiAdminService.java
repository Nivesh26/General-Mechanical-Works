package com.gmw.General.Mechanical.Works.ai;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.AdminAssistantMessage;
import com.gmw.General.Mechanical.Works.chat.AdminAssistantMessageRepository;
import com.gmw.General.Mechanical.Works.chat.AdminAssistantChatService;
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

	public ChatAiAdminService(
			@Lazy AdminAssistantChatService adminAssistantChatService,
			AdminAssistantMessageRepository adminAssistantMessageRepository,
			OllamaClient ollamaClient,
			ChatAiAdminPromptBuilder promptBuilder,
			ChatAiAdminContext adminContext) {
		this.adminAssistantChatService = adminAssistantChatService;
		this.adminAssistantMessageRepository = adminAssistantMessageRepository;
		this.ollamaClient = ollamaClient;
		this.promptBuilder = promptBuilder;
		this.adminContext = adminContext;
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

	private void sendAssistantMessage(Long adminId, long replyStartedAt, String text) {
		ChatAiReplyDelay.ensureMinimumDelay(replyStartedAt);
		adminAssistantChatService.sendAssistantMessage(adminId, text);
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
