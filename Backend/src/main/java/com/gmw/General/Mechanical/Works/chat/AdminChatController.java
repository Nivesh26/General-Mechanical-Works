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

	public AdminChatController(ChatService chatService) {
		this.chatService = chatService;
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
