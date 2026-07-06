package com.gmw.General.Mechanical.Works.chat;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.ai.ChatAiService;
import com.gmw.General.Mechanical.Works.storage.ChatUploadedFile;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class ChatService {

	private static final DateTimeFormatter DISPLAY_TIME =
			DateTimeFormatter.ofPattern("h:mm a", Locale.US).withZone(ZoneId.systemDefault());

	private final ChatMessageRepository chatMessageRepository;
	private final ChatMessageHiddenRepository chatMessageHiddenRepository;
	private final ChatConversationSettingsRepository chatConversationSettingsRepository;
	private final UserRepository userRepository;
	private final ChatWebSocketSessions chatWebSocketSessions;
	private final ImageStorageService imageStorageService;
	private final ChatAiService chatAiService;

	public ChatService(
			ChatMessageRepository chatMessageRepository,
			ChatMessageHiddenRepository chatMessageHiddenRepository,
			ChatConversationSettingsRepository chatConversationSettingsRepository,
			UserRepository userRepository,
			ChatWebSocketSessions chatWebSocketSessions,
			ImageStorageService imageStorageService,
			@Lazy ChatAiService chatAiService) {
		this.chatMessageRepository = chatMessageRepository;
		this.chatMessageHiddenRepository = chatMessageHiddenRepository;
		this.chatConversationSettingsRepository = chatConversationSettingsRepository;
		this.userRepository = userRepository;
		this.chatWebSocketSessions = chatWebSocketSessions;
		this.imageStorageService = imageStorageService;
		this.chatAiService = chatAiService;
	}

	@Transactional(readOnly = true)
	public List<ChatMessageDto> listMessagesForUser(String email) {
		User user = requireUser(email);
		return visibleMessagesForViewer(user.getId(), chatMessageRepository.findByUserIdOrderByCreatedAtAsc(user.getId()));
	}

	@Transactional(readOnly = true)
	public List<ChatMessageDto> listMessagesForAdmin(String email, Long userId) {
		requireAdmin(email);
		User admin = requireUser(email);
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return visibleMessagesForViewer(admin.getId(), chatMessageRepository.findByUserIdOrderByCreatedAtAsc(userId));
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
					String preview = last != null ? messagePreview(last) : "";
					String time = summary.getLastAt() != null ? DISPLAY_TIME.format(summary.getLastAt()) : "";
					return new ChatConversationDto(
							user.getId(),
							user.getName(),
							preview,
							time,
							chatWebSocketSessions.isUserOnline(user.getId()),
							user.getProfilePicture());
				})
				.filter(java.util.Objects::nonNull)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ChatInboxPreviewRow> listInboxPreview(int limit) {
		Map<Long, User> usersById = userRepository.findAllByRoleOrderByIdAsc(Role.USER).stream()
				.collect(Collectors.toMap(User::getId, u -> u));
		return chatMessageRepository.findConversationSummaries().stream()
				.map(summary -> {
					User user = usersById.get(summary.getUserId());
					if (user == null) {
						return null;
					}
					ChatMessage last = chatMessageRepository.findFirstByUserIdOrderByCreatedAtDesc(summary.getUserId());
					if (last == null) {
						return null;
					}
					Instant lastAt = summary.getLastAt() != null ? summary.getLastAt() : last.getCreatedAt();
					return new ChatInboxPreviewRow(
							user.getId(),
							user.getName(),
							messagePreview(last),
							lastAt,
							last.getId(),
							last.getSender(),
							chatWebSocketSessions.isUserOnline(user.getId()),
							user.getProfilePicture());
				})
				.filter(java.util.Objects::nonNull)
				.limit(Math.max(1, limit))
				.toList();
	}

	public record ChatInboxPreviewRow(
			Long userId,
			String userName,
			String snippet,
			Instant lastMessageAt,
			Long lastMessageId,
			ChatSender lastMessageSender,
			boolean online,
			String profilePicture) {
	}

	@Transactional
	public ChatMessageDto sendFromAssistant(Long userId, String text) {
		return sendFromAssistant(userId, text, null, null);
	}

	@Transactional
	public ChatMessageDto sendFromAssistant(Long userId, String text, String attachmentUrl, String attachmentName) {
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		ChatAttachmentType attachmentType = StringUtils.hasText(attachmentUrl) ? ChatAttachmentType.IMAGE : null;
		return saveAndBroadcast(
				userId,
				ChatSender.ASSISTANT,
				new SendChatMessageRequest(text, null, null, trimToNull(attachmentUrl), attachmentType, trimToNull(attachmentName)));
	}

	@Transactional(readOnly = true)
	public ChatConversationAiDto getAiSettingsForAdmin(String email, Long userId) {
		requireAdmin(email);
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return new ChatConversationAiDto(isAiEnabledForUser(userId));
	}

	@Transactional(readOnly = true)
	public ChatConversationAiDto getAiSettingsForUser(String email) {
		User user = requireUser(email);
		return new ChatConversationAiDto(isAiEnabledForUser(user.getId()));
	}

	@Transactional
	public ChatConversationAiDto setAiEnabledForAdmin(String email, Long userId, boolean aiEnabled) {
		requireAdmin(email);
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		ChatConversationSettings settings = chatConversationSettingsRepository.findById(userId)
				.orElseGet(() -> {
					ChatConversationSettings created = new ChatConversationSettings();
					created.setUserId(userId);
					created.setAiEnabled(true);
					return created;
				});
		settings.setAiEnabled(aiEnabled);
		chatConversationSettingsRepository.save(settings);
		chatWebSocketSessions.broadcastAiSettings(userId, aiEnabled);
		return new ChatConversationAiDto(aiEnabled);
	}

	public boolean isAiEnabledForUser(Long userId) {
		return chatConversationSettingsRepository.findById(userId)
				.map(ChatConversationSettings::isAiEnabled)
				.orElse(true);
	}

	@Transactional
	public ChatMessageDto sendFromUser(String email, SendChatMessageRequest request) {
		User user = requireUser(email);
		return saveAndBroadcast(user.getId(), ChatSender.USER, request);
	}

	public ChatMessageDto sendFromUserWithFile(String email, String text, MultipartFile file, Long replyToId) {
		SendChatMessageRequest request = buildRequestWithFile(text, file, replyToId, null);
		return sendFromUser(email, request);
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
		return saveAndBroadcast(request.targetUserId(), ChatSender.ADMIN, request);
	}

	public ChatMessageDto sendFromAdminWithFile(
			String email,
			Long targetUserId,
			String text,
			MultipartFile file,
			Long replyToId) {
		requireAdmin(email);
		if (!userRepository.existsById(targetUserId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		SendChatMessageRequest request = buildRequestWithFile(text, file, replyToId, targetUserId);
		return sendFromAdmin(email, request);
	}

	@Transactional
	public ChatMessageDto sendFromAdminByUserId(Long targetUserId, String text, Long replyToId) {
		return sendFromAdminByUserId(
				targetUserId,
				new SendChatMessageRequest(text, replyToId, targetUserId, null, null, null));
	}

	@Transactional
	public ChatMessageDto sendFromUserById(Long userId, String text, Long replyToId) {
		return sendFromUserById(userId, new SendChatMessageRequest(text, replyToId, null, null, null, null));
	}

	@Transactional
	public ChatMessageDto sendFromAdminByUserId(Long targetUserId, SendChatMessageRequest request) {
		validateRequest(request);
		if (!userRepository.existsById(targetUserId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return saveAndBroadcast(
				targetUserId,
				ChatSender.ADMIN,
				new SendChatMessageRequest(
						normalizeText(request.text()),
						request.replyToId(),
						targetUserId,
						request.attachmentUrl(),
						request.attachmentType(),
						request.attachmentName()));
	}

	@Transactional
	public ChatMessageDto sendFromUserById(Long userId, SendChatMessageRequest request) {
		validateRequest(request);
		if (!userRepository.existsById(userId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return saveAndBroadcast(userId, ChatSender.USER, request);
	}

	@Transactional
	public void deleteMessageForUser(String email, Long messageId, ChatDeleteScope scope) {
		User user = requireUser(email);
		ChatMessage message = requireMessageInConversation(messageId, user.getId());
		deleteMessage(user, message, scope);
	}

	@Transactional
	public void deleteMessageForAdmin(String email, Long conversationUserId, Long messageId, ChatDeleteScope scope) {
		requireAdmin(email);
		User admin = requireUser(email);
		if (!userRepository.existsById(conversationUserId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		ChatMessage message = requireMessageInConversation(messageId, conversationUserId);
		deleteMessage(admin, message, scope);
	}

	private void deleteMessage(User actor, ChatMessage message, ChatDeleteScope scope) {
		if (scope == ChatDeleteScope.SELF) {
			hideMessageForViewer(actor.getId(), message);
			return;
		}
		requireCanDeleteForEveryone(actor, message);
		removeMessageForEveryone(message);
	}

	private void hideMessageForViewer(Long viewerUserId, ChatMessage message) {
		if (!chatMessageHiddenRepository.existsByMessageIdAndHiddenByUserId(message.getId(), viewerUserId)) {
			ChatMessageHidden hidden = new ChatMessageHidden();
			hidden.setMessageId(message.getId());
			hidden.setHiddenByUserId(viewerUserId);
			chatMessageHiddenRepository.save(hidden);
		}
	}

	private void requireCanDeleteForEveryone(User actor, ChatMessage message) {
		boolean isAdmin = actor.getRole() == Role.ADMIN;
		if (isAdmin) {
			if (message.getSender() != ChatSender.ADMIN) {
				throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own messages for everyone");
			}
			return;
		}
		if (message.getSender() != ChatSender.USER || !message.getUserId().equals(actor.getId())) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can delete only your own messages for everyone");
		}
	}

	private void removeMessageForEveryone(ChatMessage message) {
		if (StringUtils.hasText(message.getAttachmentUrl()) && message.getSender() != ChatSender.ASSISTANT) {
			imageStorageService.deleteIfStored(message.getAttachmentUrl());
		}
		chatMessageHiddenRepository.deleteByMessageId(message.getId());
		chatMessageRepository.delete(message);
		chatWebSocketSessions.broadcastMessageDeleted(
				new ChatMessageDeletedDto(message.getId(), message.getUserId(), ChatDeleteScope.EVERYONE));
	}

	private ChatMessage requireMessageInConversation(Long messageId, Long conversationUserId) {
		ChatMessage message = chatMessageRepository.findById(messageId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found"));
		if (!message.getUserId().equals(conversationUserId)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Message not found");
		}
		return message;
	}

	private List<ChatMessageDto> visibleMessagesForViewer(Long viewerUserId, List<ChatMessage> messages) {
		if (messages.isEmpty()) {
			return List.of();
		}
		List<Long> messageIds = messages.stream().map(ChatMessage::getId).toList();
		Set<Long> hiddenIds = new HashSet<>(
				chatMessageHiddenRepository.findHiddenMessageIdsForViewer(viewerUserId, messageIds));
		return messages.stream()
				.filter(message -> !hiddenIds.contains(message.getId()))
				.map(ChatMapper::toDto)
				.toList();
	}

	private SendChatMessageRequest buildRequestWithFile(
			String text,
			MultipartFile file,
			Long replyToId,
			Long targetUserId) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
		}
		ChatUploadedFile uploaded = imageStorageService.uploadChatFile(file);
		SendChatMessageRequest request = new SendChatMessageRequest(
				normalizeText(text),
				replyToId,
				targetUserId,
				uploaded.url(),
				uploaded.type(),
				uploaded.fileName());
		validateRequest(request);
		return request;
	}

	private ChatMessageDto saveAndBroadcast(Long userId, ChatSender sender, SendChatMessageRequest request) {
		validateRequest(request);
		ChatMessage message = new ChatMessage();
		message.setUserId(userId);
		message.setSender(sender);
		message.setBody(normalizeText(request.text()));
		message.setReplyToId(request.replyToId());
		message.setAttachmentUrl(trimToNull(request.attachmentUrl()));
		message.setAttachmentType(request.attachmentType());
		message.setAttachmentName(trimToNull(request.attachmentName()));
		ChatMessage saved = chatMessageRepository.save(message);
		ChatMessageDto dto = ChatMapper.toDto(saved);
		chatWebSocketSessions.broadcastMessage(dto);
		if (sender == ChatSender.USER) {
			chatAiService.maybeReplyAsync(userId);
		}
		return dto;
	}

	private static void validateRequest(SendChatMessageRequest request) {
		boolean hasText = StringUtils.hasText(request.text());
		boolean hasAttachment = StringUtils.hasText(request.attachmentUrl()) && request.attachmentType() != null;
		if (!hasText && !hasAttachment) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message text or file is required");
		}
	}

	private static String normalizeText(String text) {
		return text == null ? "" : text.trim();
	}

	private static String trimToNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
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

	private static String messagePreview(ChatMessage message) {
		if (StringUtils.hasText(message.getBody())) {
			return truncate(message.getBody(), 80);
		}
		if (message.getAttachmentType() == ChatAttachmentType.IMAGE) {
			return "Photo";
		}
		if (message.getAttachmentType() == ChatAttachmentType.PDF) {
			return "PDF file";
		}
		return "";
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
					message.getAttachmentUrl(),
					message.getAttachmentType(),
					message.getAttachmentName(),
					message.getCreatedAt().toString());
		}
	}
}
