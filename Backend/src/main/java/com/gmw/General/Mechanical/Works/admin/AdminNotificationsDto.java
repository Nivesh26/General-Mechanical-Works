package com.gmw.General.Mechanical.Works.admin;

import java.util.List;

public record AdminNotificationsDto(int count, List<AdminNotificationItemDto> notifications) {

	public record AdminNotificationItemDto(
			String id,
			String type,
			String title,
			String message,
			String linkPath,
			String createdAt) {
	}
}
