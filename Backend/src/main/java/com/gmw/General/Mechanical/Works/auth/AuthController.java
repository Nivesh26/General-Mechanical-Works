package com.gmw.General.Mechanical.Works.auth;

import java.security.Principal;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;

	public AuthController(AuthService authService) {
		this.authService = authService;
	}

	@PostMapping("/signup")
	public AuthResponse signup(@Valid @RequestBody SignupRequest request) {
		return authService.signup(request);
	}

	@PostMapping("/login")
	public AuthResponse login(@Valid @RequestBody LoginRequest request) {
		return authService.login(request);
	}

	@GetMapping("/me")
	public UserProfileDto me(Principal principal) {
		return authService.getProfile(principal.getName());
	}

	@PostMapping("/me/password")
	public void changePassword(Principal principal, @Valid @RequestBody ChangePasswordRequest request) {
		authService.changePassword(principal.getName(), request);
	}

	@PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public UserProfileDto uploadAvatar(Principal principal, @RequestPart("file") MultipartFile file) {
		return authService.uploadAvatar(principal.getName(), file);
	}

	@PostMapping(value = "/me/cover-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public UserProfileDto uploadCoverPhoto(Principal principal, @RequestPart("file") MultipartFile file) {
		return authService.uploadCoverPhoto(principal.getName(), file);
	}

	@DeleteMapping("/me/avatar")
	public UserProfileDto deleteAvatar(Principal principal) {
		return authService.clearAvatar(principal.getName());
	}

	@DeleteMapping("/me/cover-photo")
	public UserProfileDto deleteCoverPhoto(Principal principal) {
		return authService.clearCoverPhoto(principal.getName());
	}
}
