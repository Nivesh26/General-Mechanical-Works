package com.gmw.General.Mechanical.Works.chat;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import tools.jackson.core.JacksonException;
import tools.jackson.databind.ObjectMapper;

@Component
public class ChatWebSocketSessions {

	private final ObjectMapper objectMapper;
	private final Map<String, ChatSocketUser> sessions = new ConcurrentHashMap<>();
	private final Map<Long, Set<String>> userSessionIds = new ConcurrentHashMap<>();
	private final Set<String> adminSessionIds = ConcurrentHashMap.newKeySet();

	public ChatWebSocketSessions(ObjectMapper objectMapper) {
		this.objectMapper = objectMapper;
	}

	public void register(WebSocketSession session, Long userId, boolean admin) {
		String sessionId = session.getId();
		sessions.put(sessionId, new ChatSocketUser(userId, admin, session));
		if (admin) {
			adminSessionIds.add(sessionId);
		} else if (userId != null) {
			userSessionIds.computeIfAbsent(userId, ignored -> ConcurrentHashMap.newKeySet()).add(sessionId);
		}
	}

	public void unregister(WebSocketSession session) {
		String sessionId = session.getId();
		ChatSocketUser user = sessions.remove(sessionId);
		if (user == null) {
			return;
		}
		if (user.admin()) {
			adminSessionIds.remove(sessionId);
		} else if (user.userId() != null) {
			Set<String> ids = userSessionIds.get(user.userId());
			if (ids != null) {
				ids.remove(sessionId);
				if (ids.isEmpty()) {
					userSessionIds.remove(user.userId());
				}
			}
		}
	}

	public boolean isUserOnline(Long userId) {
		Set<String> ids = userSessionIds.get(userId);
		return ids != null && !ids.isEmpty();
	}

	public void broadcastMessageDeleted(ChatMessageDeletedDto deleted) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("event", "message_deleted");
		payload.put("deleted", deleted);
		String json = writeJson(payload);
		for (String adminSessionId : adminSessionIds) {
			sendToSession(adminSessionId, json);
		}
		if (deleted.userId() != null) {
			Set<String> ids = userSessionIds.get(deleted.userId());
			if (ids != null) {
				for (String sessionId : ids) {
					sendToSession(sessionId, json);
				}
			}
		}
	}

	public void broadcastMessage(ChatMessageDto message) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("event", "message");
		payload.put("message", message);
		String json = writeJson(payload);
		for (String adminSessionId : adminSessionIds) {
			sendToSession(adminSessionId, json);
		}
		if (message.userId() != null) {
			Set<String> ids = userSessionIds.get(message.userId());
			if (ids != null) {
				for (String sessionId : ids) {
					sendToSession(sessionId, json);
				}
			}
		}
	}

	public void sendEvent(WebSocketSession session, String event, Object data) {
		Map<String, Object> payload = new HashMap<>();
		payload.put("event", event);
		if (data != null) {
			payload.put("data", data);
		}
		sendToSession(session.getId(), writeJson(payload));
	}

	private void sendToSession(String sessionId, String payload) {
		ChatSocketUser user = sessions.get(sessionId);
		if (user == null || !user.session().isOpen()) {
			return;
		}
		try {
			synchronized (user.session()) {
				if (user.session().isOpen()) {
					user.session().sendMessage(new TextMessage(payload));
				}
			}
		} catch (IOException ignored) {
			/* session will be cleaned up on close */
		}
	}

	private String writeJson(Object value) {
		try {
			return objectMapper.writeValueAsString(value);
		} catch (JacksonException ex) {
			return "{}";
		}
	}

	private record ChatSocketUser(Long userId, boolean admin, WebSocketSession session) {
	}
}
