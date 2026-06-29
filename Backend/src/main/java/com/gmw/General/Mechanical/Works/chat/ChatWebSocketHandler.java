package com.gmw.General.Mechanical.Works.chat;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

@Component
public class ChatWebSocketHandler extends TextWebSocketHandler {

	private final ChatService chatService;
	private final ChatWebSocketSessions chatWebSocketSessions;
	private final ObjectMapper objectMapper;

	public ChatWebSocketHandler(
			ChatService chatService,
			ChatWebSocketSessions chatWebSocketSessions,
			ObjectMapper objectMapper) {
		this.chatService = chatService;
		this.chatWebSocketSessions = chatWebSocketSessions;
		this.objectMapper = objectMapper;
	}

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		Long userId = (Long) session.getAttributes().get("userId");
		boolean admin = Boolean.TRUE.equals(session.getAttributes().get("admin"));
		chatWebSocketSessions.register(session, userId, admin);
		chatWebSocketSessions.sendEvent(session, "connected", null);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		JsonNode root = objectMapper.readTree(message.getPayload());
		String action = root.path("action").asText("");
		if (!"send".equals(action)) {
			return;
		}
		String text = root.path("text").asText("").trim();
		if (text.isEmpty()) {
			return;
		}
		Long replyToId = root.hasNonNull("replyToId") ? root.get("replyToId").asLong() : null;
		boolean admin = Boolean.TRUE.equals(session.getAttributes().get("admin"));
		Long userId = (Long) session.getAttributes().get("userId");

		if (admin) {
			Long targetUserId = root.hasNonNull("targetUserId") ? root.get("targetUserId").asLong() : null;
			if (targetUserId == null) {
				return;
			}
			chatService.sendFromAdminByUserId(targetUserId, text, replyToId);
		} else if (userId != null) {
			chatService.sendFromUserById(userId, text, replyToId);
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
		chatWebSocketSessions.unregister(session);
	}
}
