package com.gmw.General.Mechanical.Works.chat;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "admin_assistant_message", indexes = {
		@Index(name = "idx_admin_assistant_admin_created", columnList = "admin_id, created_at")
})
public class AdminAssistantMessage {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "admin_id", nullable = false)
	private Long adminId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private ChatSender sender;

	@Column(nullable = false, columnDefinition = "TEXT")
	private String body = "";

	@Column(name = "attachment_url", length = 1024)
	private String attachmentUrl;

	@Enumerated(EnumType.STRING)
	@Column(name = "attachment_type", length = 16)
	private ChatAttachmentType attachmentType;

	@Column(name = "attachment_name", length = 255)
	private String attachmentName;

	@Column(name = "created_at", nullable = false)
	private Instant createdAt;

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = Instant.now();
		}
	}

	public Long getId() {
		return id;
	}

	public Long getAdminId() {
		return adminId;
	}

	public void setAdminId(Long adminId) {
		this.adminId = adminId;
	}

	public ChatSender getSender() {
		return sender;
	}

	public void setSender(ChatSender sender) {
		this.sender = sender;
	}

	public String getBody() {
		return body;
	}

	public void setBody(String body) {
		this.body = body == null ? "" : body;
	}

	public String getAttachmentUrl() {
		return attachmentUrl;
	}

	public void setAttachmentUrl(String attachmentUrl) {
		this.attachmentUrl = attachmentUrl;
	}

	public ChatAttachmentType getAttachmentType() {
		return attachmentType;
	}

	public void setAttachmentType(ChatAttachmentType attachmentType) {
		this.attachmentType = attachmentType;
	}

	public String getAttachmentName() {
		return attachmentName;
	}

	public void setAttachmentName(String attachmentName) {
		this.attachmentName = attachmentName;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}
}
