package com.gmw.General.Mechanical.Works.chat;

import java.util.List;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.ai.ChatAiAdminIntent;
import com.gmw.General.Mechanical.Works.ai.ChatAiAdminService;
import com.gmw.General.Mechanical.Works.storage.ChatUploadedFile;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class AdminAssistantChatService {

	private final AdminAssistantMessageRepository adminAssistantMessageRepository;
	private final UserRepository userRepository;
	private final ChatWebSocketSessions chatWebSocketSessions;
	private final ChatAiAdminService chatAiAdminService;
	private final ImageStorageService imageStorageService;

	public AdminAssistantChatService(
			AdminAssistantMessageRepository adminAssistantMessageRepository,
			UserRepository userRepository,
			ChatWebSocketSessions chatWebSocketSessions,
			@Lazy ChatAiAdminService chatAiAdminService,
			ImageStorageService imageStorageService) {
		this.adminAssistantMessageRepository = adminAssistantMessageRepository;
		this.userRepository = userRepository;
		this.chatWebSocketSessions = chatWebSocketSessions;
		this.chatAiAdminService = chatAiAdminService;
		this.imageStorageService = imageStorageService;
	}

	@Transactional
	public List<AdminAssistantMessageDto> listMessages(String adminEmail) {
		Long adminId = requireAdminId(adminEmail);
		List<AdminAssistantMessage> messages =
				adminAssistantMessageRepository.findByAdminIdOrderByCreatedAtAsc(adminId);
		if (messages.isEmpty()) {
			return List.of(toDto(createWelcomeMessage(adminId)));
		}
		return messages.stream().map(AdminAssistantChatService::toDto).toList();
	}

	@Transactional
	public AdminAssistantMessageDto sendFromAdmin(String adminEmail, String text) {
		return sendFromAdmin(adminEmail, text, null, null, null);
	}

	@Transactional
	public AdminAssistantMessageDto sendFromAdminWithFile(String adminEmail, String text, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
		}
		ChatUploadedFile uploaded = imageStorageService.uploadChatFile(file);
		return sendFromAdmin(adminEmail, text, uploaded.url(), uploaded.type(), uploaded.fileName());
	}

	@Transactional
	public AdminAssistantMessageDto sendFromAdmin(
			String adminEmail,
			String text,
			String attachmentUrl,
			ChatAttachmentType attachmentType,
			String attachmentName) {
		validateMessage(text, attachmentUrl, attachmentType);
		Long adminId = requireAdminId(adminEmail);
		AdminAssistantMessage message = new AdminAssistantMessage();
		message.setAdminId(adminId);
		message.setSender(ChatSender.ADMIN);
		message.setBody(normalizeText(text));
		message.setAttachmentUrl(trimToNull(attachmentUrl));
		message.setAttachmentType(attachmentType);
		message.setAttachmentName(trimToNull(attachmentName));
		AdminAssistantMessage saved = adminAssistantMessageRepository.save(message);
		AdminAssistantMessageDto dto = toDto(saved);
		chatWebSocketSessions.broadcastAdminAssistantMessage(adminId, dto);
		chatAiAdminService.maybeReplyAsync(adminId);
		return dto;
	}

	@Transactional
	public AdminAssistantMessageDto sendAssistantMessage(Long adminId, String text) {
		return sendAssistantMessage(adminId, text, null, null);
	}

	@Transactional
	public AdminAssistantMessageDto sendAssistantMessage(
			Long adminId,
			String text,
			String attachmentUrl,
			String attachmentName) {
		AdminAssistantMessage message = new AdminAssistantMessage();
		message.setAdminId(adminId);
		message.setSender(ChatSender.ASSISTANT);
		message.setBody(text == null ? "" : text.trim());
		if (StringUtils.hasText(attachmentUrl)) {
			message.setAttachmentUrl(attachmentUrl.trim());
			message.setAttachmentType(ChatAttachmentType.IMAGE);
			message.setAttachmentName(trimToNull(attachmentName));
		}
		AdminAssistantMessage saved = adminAssistantMessageRepository.save(message);
		AdminAssistantMessageDto dto = toDto(saved);
		chatWebSocketSessions.broadcastAdminAssistantMessage(adminId, dto);
		return dto;
	}

	private AdminAssistantMessage createWelcomeMessage(Long adminId) {
		AdminAssistantMessage welcome = new AdminAssistantMessage();
		welcome.setAdminId(adminId);
		welcome.setSender(ChatSender.ASSISTANT);
		welcome.setBody(ChatAiAdminIntent.WELCOME_MESSAGE);
		return adminAssistantMessageRepository.save(welcome);
	}

	private Long requireAdminId(String adminEmail) {
		User admin = userRepository.findByEmailIgnoreCase(adminEmail.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		if (admin.getRole() != Role.ADMIN) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Admin access required");
		}
		return admin.getId();
	}

	private static void validateMessage(String text, String attachmentUrl, ChatAttachmentType attachmentType) {
		boolean hasText = StringUtils.hasText(text);
		boolean hasAttachment = StringUtils.hasText(attachmentUrl) && attachmentType != null;
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

	private static AdminAssistantMessageDto toDto(AdminAssistantMessage message) {
		return new AdminAssistantMessageDto(
				message.getId(),
				message.getAdminId(),
				message.getSender(),
				message.getBody(),
				message.getAttachmentUrl(),
				message.getAttachmentType(),
				message.getAttachmentName(),
				message.getCreatedAt().toString());
	}
}
