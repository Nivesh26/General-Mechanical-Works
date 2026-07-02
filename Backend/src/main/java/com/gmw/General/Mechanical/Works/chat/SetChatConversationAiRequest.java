package com.gmw.General.Mechanical.Works.chat;

import jakarta.validation.constraints.NotNull;

public record SetChatConversationAiRequest(@NotNull Boolean aiEnabled) {
}
