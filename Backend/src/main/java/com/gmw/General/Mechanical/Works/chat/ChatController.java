package com.gmw.General.Mechanical.Works.chat;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chat/me")
public class ChatController {

	private final ChatService chatService;

	public ChatController(ChatService chatService) {
		this.chatService = chatService;
	}

	@GetMapping("/messages")
	public List<ChatMessageDto> messages(Principal principal) {
		return chatService.listMessagesForUser(principal.getName());
	}

	@PostMapping("/messages")
	public ChatMessageDto send(Principal principal, @Valid @RequestBody SendChatMessageRequest request) {
		return chatService.sendFromUser(principal.getName(), request);
	}
}
