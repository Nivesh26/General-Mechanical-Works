package com.gmw.General.Mechanical.Works.auth;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.config.JwtService;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class AuthService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;

	public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
	}

	@Transactional
	public AuthResponse signup(SignupRequest request) {
		String normalizedEmail = request.getEmail().trim().toLowerCase();
		if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
			throw new EmailAlreadyRegisteredException(normalizedEmail);
		}
		User user = new User();
		user.setName(request.getName().trim());
		user.setEmail(normalizedEmail);
		user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
		String phone = request.getPhone();
		user.setPhone(StringUtils.hasText(phone) ? phone.trim() : null);
		user.setRole(Role.USER);
		User saved = userRepository.save(user);
		return buildAuthResponse(saved);
	}

	@Transactional(readOnly = true)
	public AuthResponse login(LoginRequest request) {
		String normalizedEmail = request.getEmail().trim().toLowerCase();
		User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
				.orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
		if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
			throw new BadCredentialsException("Invalid email or password");
		}
		return buildAuthResponse(user);
	}

	@Transactional(readOnly = true)
	public UserProfileDto getProfile(String email) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return toProfileDto(user);
	}

	@Transactional(readOnly = true)
	public List<UserProfileDto> listAllUsersForAdmin() {
		return userRepository.findAllByRoleOrderByIdAsc(Role.USER).stream()
				.map(this::toProfileDto)
				.toList();
	}

	@Transactional
	public UserProfileDto updateProfile(String email, UpdateProfileRequest request) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		if (request.getName() != null && StringUtils.hasText(request.getName())) {
			user.setName(request.getName().trim());
		}
		if (request.getPhone() != null) {
			user.setPhone(StringUtils.hasText(request.getPhone()) ? request.getPhone().trim() : null);
		}
		if (request.getGender() != null) {
			user.setGender(request.getGender());
		}
		if (request.getDateOfBirth() != null) {
			user.setDateOfBirth(request.getDateOfBirth());
		}
		if (request.getLocation() != null) {
			user.setLocation(StringUtils.hasText(request.getLocation()) ? request.getLocation().trim() : null);
		}
		return toProfileDto(userRepository.save(user));
	}

	private AuthResponse buildAuthResponse(User user) {
		String token = jwtService.generateToken(user);
		return new AuthResponse(
				token,
				"Bearer",
				user.getId(),
				user.getName(),
				user.getEmail(),
				user.getPhone(),
				user.getRole(),
				user.getGender(),
				user.getDateOfBirth(),
				user.getLocation());
	}

	private UserProfileDto toProfileDto(User user) {
		return new UserProfileDto(
				user.getId(),
				user.getName(),
				user.getEmail(),
				user.getPhone(),
				user.getRole(),
				user.getGender(),
				user.getDateOfBirth(),
				user.getLocation());
	}
}
