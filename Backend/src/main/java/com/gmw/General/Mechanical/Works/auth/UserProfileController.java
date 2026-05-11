package com.gmw.General.Mechanical.Works.auth;

import java.security.Principal;

import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

	private final AuthService authService;

	public UserProfileController(AuthService authService) {
		this.authService = authService;
	}

	@PatchMapping("/me")
	public ProfilePatchResponse updateProfile(Principal principal, @RequestBody UpdateProfileRequest request) {
		return authService.updateProfile(principal.getName(), request);
	}
}
