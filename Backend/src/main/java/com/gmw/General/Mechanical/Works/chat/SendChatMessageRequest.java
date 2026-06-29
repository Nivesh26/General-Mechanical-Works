package com.gmw.General.Mechanical.Works.chat;

import jakarta.validation.constraints.Size;

public record SendChatMessageRequest(
		@Size(max = 4000) String text,
		Long replyToId,
		Long targetUserId,
		@Size(max = 1024) String attachmentUrl,
		ChatAttachmentType attachmentType,
		@Size(max = 255) String attachmentName) {
}
