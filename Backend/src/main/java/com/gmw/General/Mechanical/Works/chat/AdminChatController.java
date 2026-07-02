package com.gmw.General.Mechanical.Works.chat;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/chat")
public class AdminChatController {

	private final ChatService chatService;
	private final AdminAssistantChatService adminAssistantChatService;

	public AdminChatController(ChatService chatService, AdminAssistantChatService adminAssistantChatService) {
		this.chatService = chatService;
		this.adminAssistantChatService = adminAssistantChatService;
	}

	@GetMapping("/assistant/messages")
	public List<AdminAssistantMessageDto> assistantMessages(java.security.Principal principal) {
		return adminAssistantChatService.listMessages(principal.getName());
	}

	@PostMapping("/assistant/messages")
	public AdminAssistantMessageDto sendAssistantMessage(
			java.security.Principal principal,
			@Valid @RequestBody SendAdminAssistantMessageRequest request) {
		return adminAssistantChatService.sendFromAdmin(principal.getName(), request.text());
	}

	@GetMapping("/conversations")
	public List<ChatConversationDto> conversations() {
		return chatService.listConversationsForAdmin();
	}

	@GetMapping("/conversations/{userId}/messages")
	public List<ChatMessageDto> messages(
			java.security.Principal principal,
			@PathVariable Long userId) {
		return chatService.listMessagesForAdmin(principal.getName(), userId);
	}

	@PostMapping("/conversations/{userId}/messages")
	public ChatMessageDto send(
			java.security.Principal principal,
			@PathVariable Long userId,
			@Valid @RequestBody SendChatMessageRequest request) {
		return chatService.sendFromAdmin(
				principal.getName(),
				new SendChatMessageRequest(
						request.text(),
						request.replyToId(),
						userId,
						request.attachmentUrl(),
						request.attachmentType(),
						request.attachmentName()));
	}

	@PostMapping(value = "/conversations/{userId}/messages/with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ChatMessageDto sendWithFile(
			java.security.Principal principal,
			@PathVariable Long userId,
			@RequestParam(value = "text", required = false) String text,
			@RequestPart("file") MultipartFile file,
			@RequestParam(value = "replyToId", required = false) Long replyToId) {
		return chatService.sendFromAdminWithFile(principal.getName(), userId, text, file, replyToId);
	}

	@GetMapping("/conversations/{userId}/ai")
	public ChatConversationAiDto getAiSettings(
			java.security.Principal principal,
			@PathVariable Long userId) {
		return chatService.getAiSettingsForAdmin(principal.getName(), userId);
	}

	@org.springframework.web.bind.annotation.PutMapping("/conversations/{userId}/ai")
	public ChatConversationAiDto setAiSettings(
			java.security.Principal principal,
			@PathVariable Long userId,
			@Valid @RequestBody SetChatConversationAiRequest request) {
		return chatService.setAiEnabledForAdmin(principal.getName(), userId, request.aiEnabled());
	}

	@DeleteMapping("/conversations/{userId}/messages/{messageId}")
	public void delete(
			java.security.Principal principal,
			@PathVariable Long userId,
			@PathVariable Long messageId,
			@RequestParam(defaultValue = "self") String scope) {
		chatService.deleteMessageForAdmin(
				principal.getName(),
				userId,
				messageId,
				"everyone".equalsIgnoreCase(scope) ? ChatDeleteScope.EVERYONE : ChatDeleteScope.SELF);
	}
}
