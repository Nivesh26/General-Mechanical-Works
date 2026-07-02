package com.gmw.General.Mechanical.Works.chat;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_conversation_settings")
public class ChatConversationSettings {

	@Id
	@Column(name = "user_id", nullable = false)
	private Long userId;

	@Column(name = "ai_enabled", nullable = false)
	private boolean aiEnabled = true;

	public Long getUserId() {
		return userId;
	}

	public void setUserId(Long userId) {
		this.userId = userId;
	}

	public boolean isAiEnabled() {
		return aiEnabled;
	}

	public void setAiEnabled(boolean aiEnabled) {
		this.aiEnabled = aiEnabled;
	}
}
