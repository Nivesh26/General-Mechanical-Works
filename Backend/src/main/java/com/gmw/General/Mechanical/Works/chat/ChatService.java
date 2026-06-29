package com.gmw.General.Mechanical.Works.chat;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class ChatService {

	private static final DateTimeFormatter DISPLAY_TIME =
			DateTimeFormatter.ofPattern("h:mm a", Locale.US).withZone(ZoneId.systemDefault());

	private final ChatMessageRepository chatMessageRepository;
	private final UserRepository userRepository;
	private final ChatWebSocketSessions chatWebSocketSessions;

	public ChatService(
			ChatMessageRepository chatMessageRepository,
			UserRepository userRepository,
			ChatWebSocketSessions chatWebSocketSessions) {
		this.chatMessageRepository = chatMessageRepository;
		this.userRepository = userRepository;
		this.chatWebSocketSessions = chatWebSocketSessions;
	}

	@Transactional(readOnly = true)
	public List<ChatMessageDto> listMessagesForUser(String email) {
		User user = requireUser(email);
		return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(user.getId()).stream()
				.map(ChatMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ChatMessageDto> listMessagesForAdmin(Long userId) {
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId).stream()
				.map(ChatMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ChatConversationDto> listConversationsForAdmin() {
		Map<Long, User> usersById = userRepository.findAllByRoleOrderByIdAsc(Role.USER).stream()
				.collect(Collectors.toMap(User::getId, u -> u));
		return chatMessageRepository.findConversationSummaries().stream()
				.map(summary -> {
					User user = usersById.get(summary.getUserId());
					if (user == null) {
						return null;
					}
					ChatMessage last = chatMessageRepository.findFirstByUserIdOrderByCreatedAtDesc(summary.getUserId());
					String preview = last != null ? truncate(last.getBody(), 80) : "";
					String time = summary.getLastAt() != null ? DISPLAY_TIME.format(summary.getLastAt()) : "";
					return new ChatConversationDto(
							user.getId(),
							user.getName(),
							preview,
							time,
							chatWebSocketSessions.isUserOnline(user.getId()));
				})
				.filter(java.util.Objects::nonNull)
				.toList();
	}

	@Transactional
	public ChatMessageDto sendFromUser(String email, SendChatMessageRequest request) {
		User user = requireUser(email);
		return saveAndBroadcast(user.getId(), ChatSender.USER, request.text().trim(), request.replyToId());
	}

	@Transactional
	public ChatMessageDto sendFromAdmin(String email, SendChatMessageRequest request) {
		requireAdmin(email);
		if (request.targetUserId() == null) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "targetUserId is required");
		}
		if (!userRepository.existsById(request.targetUserId())) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return saveAndBroadcast(request.targetUserId(), ChatSender.ADMIN, request.text().trim(), request.replyToId());
	}

	@Transactional
	public ChatMessageDto sendFromAdminByUserId(Long targetUserId, String text, Long replyToId) {
		if (!StringUtils.hasText(text)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message text is required");
		}
		if (!userRepository.existsById(targetUserId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return saveAndBroadcast(targetUserId, ChatSender.ADMIN, text.trim(), replyToId);
	}

	@Transactional
	public ChatMessageDto sendFromUserById(Long userId, String text, Long replyToId) {
		if (!StringUtils.hasText(text)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message text is required");
		}
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return saveAndBroadcast(userId, ChatSender.USER, text.trim(), replyToId);
	}

	private ChatMessageDto saveAndBroadcast(Long userId, ChatSender sender, String body, Long replyToId) {
		ChatMessage message = new ChatMessage();
		message.setUserId(userId);
		message.setSender(sender);
		message.setBody(body);
		message.setReplyToId(replyToId);
		ChatMessage saved = chatMessageRepository.save(message);
		ChatMessageDto dto = ChatMapper.toDto(saved);
		chatWebSocketSessions.broadcastMessage(dto);
		return dto;
	}

	private User requireUser(String email) {
		return userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
	}

	private void requireAdmin(String email) {
		User user = requireUser(email);
		if (user.getRole() != Role.ADMIN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
		}
	}

	private static String truncate(String value, int max) {
		if (!StringUtils.hasText(value)) {
			return "";
		}
		String trimmed = value.trim();
		if (trimmed.length() <= max) {
			return trimmed;
		}
		return trimmed.substring(0, max - 1) + "…";
	}

	static final class ChatMapper {

		private ChatMapper() {
		}

		static ChatMessageDto toDto(ChatMessage message) {
			return new ChatMessageDto(
					message.getId(),
					message.getUserId(),
					message.getSender(),
					message.getBody(),
					message.getReplyToId(),
					message.getCreatedAt().toString());
		}
	}
}
