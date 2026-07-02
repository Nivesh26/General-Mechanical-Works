package com.gmw.General.Mechanical.Works.chat;

public record AdminAssistantMessageDto(
		Long id,
		Long adminId,
		ChatSender sender,
		String body,
		String createdAt) {
}
