package com.gmw.General.Mechanical.Works.chat;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "chat_message_hidden",
		uniqueConstraints = @UniqueConstraint(
				name = "uk_chat_message_hidden",
				columnNames = { "message_id", "hidden_by_user_id" }))
public class ChatMessageHidden {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "message_id", nullable = false)
	private Long messageId;

	@Column(name = "hidden_by_user_id", nullable = false)
	private Long hiddenByUserId;

	@Column(name = "hidden_at", nullable = false)
	private Instant hiddenAt;

	@PrePersist
	void onCreate() {
		if (hiddenAt == null) {
			hiddenAt = Instant.now();
		}
	}

	public Long getId() {
		return id;
	}

	public Long getMessageId() {
		return messageId;
	}

	public void setMessageId(Long messageId) {
		this.messageId = messageId;
	}

	public Long getHiddenByUserId() {
		return hiddenByUserId;
	}

	public void setHiddenByUserId(Long hiddenByUserId) {
		this.hiddenByUserId = hiddenByUserId;
	}

	public Instant getHiddenAt() {
		return hiddenAt;
	}
}
