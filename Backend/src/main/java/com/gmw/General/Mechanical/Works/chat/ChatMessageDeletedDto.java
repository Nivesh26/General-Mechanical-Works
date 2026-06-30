package com.gmw.General.Mechanical.Works.chat;

public record ChatMessageDeletedDto(Long messageId, Long userId, ChatDeleteScope scope) {
}
