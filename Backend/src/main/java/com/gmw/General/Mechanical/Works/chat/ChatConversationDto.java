package com.gmw.General.Mechanical.Works.chat;

public record ChatConversationDto(
		Long userId,
		String userName,
		String lastMessage,
		String lastMessageAt,
		boolean online,
		String profilePicture) {
}
