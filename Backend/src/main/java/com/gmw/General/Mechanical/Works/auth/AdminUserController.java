package com.gmw.General.Mechanical.Works.auth;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

	private final AuthService authService;

	public AdminUserController(AuthService authService) {
		this.authService = authService;
	}

	@GetMapping
	public List<UserProfileDto> listUsers() {
		return authService.listAllUsersForAdmin();
	}
}
