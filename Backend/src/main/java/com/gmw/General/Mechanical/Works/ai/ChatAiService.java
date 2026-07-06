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
	private final ChatAiCartAction cartAction;

	public ChatAiService(
			@Lazy ChatService chatService,
			ChatMessageRepository chatMessageRepository,
			OllamaClient ollamaClient,
			ChatAiPromptBuilder promptBuilder,
			ChatAiProductReplyBuilder productReplyBuilder,
			ChatAiCartAction cartAction) {
		this.chatService = chatService;
		this.chatMessageRepository = chatMessageRepository;
		this.ollamaClient = ollamaClient;
		this.promptBuilder = promptBuilder;
		this.productReplyBuilder = productReplyBuilder;
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

	private List<ChatMessage> recentHistory(Long userId) {
		List<ChatMessage> messages = chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);
		if (messages.size() <= MAX_HISTORY_MESSAGES) {
			return messages;
		}
		return messages.subList(messages.size() - MAX_HISTORY_MESSAGES, messages.size());
	}
}
