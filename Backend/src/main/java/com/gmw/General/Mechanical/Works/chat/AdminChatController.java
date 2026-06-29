package com.gmw.General.Mechanical.Works.chat;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

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
	public List<ChatMessageDto> messages(@PathVariable Long userId) {
		return chatService.listMessagesForAdmin(userId);
	}

	@PostMapping("/conversations/{userId}/messages")
	public ChatMessageDto send(
			java.security.Principal principal,
			@PathVariable Long userId,
			@Valid @RequestBody SendChatMessageRequest request) {
		return chatService.sendFromAdmin(
				principal.getName(),
				new SendChatMessageRequest(request.text(), request.replyToId(), userId));
	}
}
