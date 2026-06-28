package com.gmw.General.Mechanical.Works.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/notifications")
public class AdminNotificationController {

	private final AdminNotificationService adminNotificationService;

	public AdminNotificationController(AdminNotificationService adminNotificationService) {
		this.adminNotificationService = adminNotificationService;
	}

	@GetMapping
	public AdminNotificationsDto list() {
		return adminNotificationService.buildNotifications();
	}
}
