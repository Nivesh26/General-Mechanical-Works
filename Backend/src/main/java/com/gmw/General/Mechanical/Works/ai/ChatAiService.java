package com.gmw.General.Mechanical.Works.ai;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Lazy;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.chat.ChatMessage;
import com.gmw.General.Mechanical.Works.chat.ChatMessageRepository;
import com.gmw.General.Mechanical.Works.chat.ChatService;
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

	public ChatAiService(
			@Lazy ChatService chatService,
			ChatMessageRepository chatMessageRepository,
			OllamaClient ollamaClient,
			ChatAiPromptBuilder promptBuilder) {
		this.chatService = chatService;
		this.chatMessageRepository = chatMessageRepository;
		this.ollamaClient = ollamaClient;
		this.promptBuilder = promptBuilder;
	}

	@Async("chatAiTaskExecutor")
	public void maybeReplyAsync(Long userId) {
		if (userId == null) {
			return;
		}
		if (!chatService.isAiEnabledForUser(userId)) {
			return;
		}
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
			if (ChatAiIntent.isSimpleGreeting(userText) || ChatAiIntent.isHelpQuestion(userText)) {
				chatService.sendFromAssistant(userId, ChatAiIntent.WELCOME_MESSAGE);
				return;
			}
			String reply = ollamaClient.chat(promptBuilder.buildMessages(history, userText));
			if (!StringUtils.hasText(reply)) {
				reply = FALLBACK_REPLY;
			}
			chatService.sendFromAssistant(userId, reply);
		} catch (Exception ex) {
			log.warn("AI reply failed for user {}: {}", userId, ex.getMessage());
			try {
				if (chatService.isAiEnabledForUser(userId)) {
					chatService.sendFromAssistant(userId, FALLBACK_REPLY);
				}
			} catch (Exception sendEx) {
				log.warn("Could not send AI fallback for user {}: {}", userId, sendEx.getMessage());
			}
		}
	}

	private List<ChatMessage> recentHistory(Long userId) {
		List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
		if (messages.size() <= MAX_HISTORY_MESSAGES) {
			return messages;
		}
		return messages.subList(messages.size() - MAX_HISTORY_MESSAGES, messages.size());
	}
}
