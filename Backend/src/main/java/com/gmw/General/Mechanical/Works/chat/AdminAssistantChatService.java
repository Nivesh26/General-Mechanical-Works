package com.gmw.General.Mechanical.Works.chat;

import java.util.List;

import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.ai.ChatAiAdminIntent;
import com.gmw.General.Mechanical.Works.ai.ChatAiAdminService;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class AdminAssistantChatService {

	private final AdminAssistantMessageRepository adminAssistantMessageRepository;
	private final UserRepository userRepository;
	private final ChatWebSocketSessions chatWebSocketSessions;
	private final ChatAiAdminService chatAiAdminService;

	public AdminAssistantChatService(
			AdminAssistantMessageRepository adminAssistantMessageRepository,
			UserRepository userRepository,
			ChatWebSocketSessions chatWebSocketSessions,
			@Lazy ChatAiAdminService chatAiAdminService) {
		this.adminAssistantMessageRepository = adminAssistantMessageRepository;
		this.userRepository = userRepository;
		this.chatWebSocketSessions = chatWebSocketSessions;
		this.chatAiAdminService = chatAiAdminService;
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
		if (!StringUtils.hasText(text)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Message text is required");
		}
		Long adminId = requireAdminId(adminEmail);
		AdminAssistantMessage message = new AdminAssistantMessage();
		message.setAdminId(adminId);
		message.setSender(ChatSender.ADMIN);
		message.setBody(text.trim());
		AdminAssistantMessage saved = adminAssistantMessageRepository.save(message);
		AdminAssistantMessageDto dto = toDto(saved);
		chatWebSocketSessions.broadcastAdminAssistantMessage(adminId, dto);
		chatAiAdminService.maybeReplyAsync(adminId);
		return dto;
	}

	@Transactional
	public AdminAssistantMessageDto sendAssistantMessage(Long adminId, String text) {
		AdminAssistantMessage message = new AdminAssistantMessage();
		message.setAdminId(adminId);
		message.setSender(ChatSender.ASSISTANT);
		message.setBody(text == null ? "" : text.trim());
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

	private static AdminAssistantMessageDto toDto(AdminAssistantMessage message) {
		return new AdminAssistantMessageDto(
				message.getId(),
				message.getAdminId(),
				message.getSender(),
				message.getBody(),
				message.getCreatedAt().toString());
	}
}
