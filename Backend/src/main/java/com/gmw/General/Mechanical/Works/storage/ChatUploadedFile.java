package com.gmw.General.Mechanical.Works.storage;

import com.gmw.General.Mechanical.Works.chat.ChatAttachmentType;

public record ChatUploadedFile(
		String url,
		ChatAttachmentType type,
		String fileName) {
}
