package com.gmw.General.Mechanical.Works.chat;

public record ChatMessageDto(
		Long id,
		Long userId,
		ChatSender sender,
		String body,
		Long replyToId,
		String createdAt) {
}
