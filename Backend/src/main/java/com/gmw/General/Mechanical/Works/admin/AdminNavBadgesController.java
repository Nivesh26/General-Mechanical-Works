package com.gmw.General.Mechanical.Works.admin;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/nav-badges")
public class AdminNavBadgesController {

	private final AdminNavBadgeService adminNavBadgeService;

	public AdminNavBadgesController(AdminNavBadgeService adminNavBadgeService) {
		this.adminNavBadgeService = adminNavBadgeService;
	}

	@GetMapping
	public AdminNavBadgesDto getBadges() {
		return adminNavBadgeService.buildBadges();
	}
}
