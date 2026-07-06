package com.gmw.General.Mechanical.Works.chat;

import java.security.Principal;
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

	@GetMapping("/ai")
	public ChatConversationAiDto aiSettings(Principal principal) {
		return chatService.getAiSettingsForUser(principal.getName());
	}

	@PostMapping("/messages")
	public ChatMessageDto send(Principal principal, @Valid @RequestBody SendChatMessageRequest request) {
		return chatService.sendFromUser(principal.getName(), request);
	}

	@PostMapping(value = "/messages/with-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ChatMessageDto sendWithFile(
			Principal principal,
			@RequestParam(value = "text", required = false) String text,
			@RequestPart("file") MultipartFile file,
			@RequestParam(value = "replyToId", required = false) Long replyToId) {
		return chatService.sendFromUserWithFile(principal.getName(), text, file, replyToId);
	}

	@DeleteMapping("/messages/{messageId}")
	public void delete(
			Principal principal,
			@PathVariable Long messageId,
			@RequestParam(defaultValue = "self") String scope) {
		chatService.deleteMessageForUser(principal.getName(), messageId, parseDeleteScope(scope));
	}

	private static ChatDeleteScope parseDeleteScope(String scope) {
		if ("everyone".equalsIgnoreCase(scope)) {
			return ChatDeleteScope.EVERYONE;
		}
		return ChatDeleteScope.SELF;
	}
}
