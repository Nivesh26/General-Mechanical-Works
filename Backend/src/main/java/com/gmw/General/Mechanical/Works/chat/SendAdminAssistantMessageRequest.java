package com.gmw.General.Mechanical.Works.chat;

import jakarta.validation.constraints.NotBlank;

public record SendAdminAssistantMessageRequest(@NotBlank String text) {
}
