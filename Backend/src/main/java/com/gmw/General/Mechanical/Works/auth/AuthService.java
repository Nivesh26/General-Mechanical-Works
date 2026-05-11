package com.gmw.General.Mechanical.Works.auth;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.config.JwtService;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class AuthService {

	public static final int MAX_AVATAR_BYTES = 2 * 1024 * 1024;

	private static final Set<String> ALLOWED_AVATAR_CONTENT_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif");
	private static final String AVATAR_WEB_PREFIX = "/uploads/profiles/";
	private static final Path AVATAR_STORAGE_DIR = Path.of("uploads", "profiles");

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
	public ProfilePatchResponse updateProfile(String email, UpdateProfileRequest request) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		boolean emailChanged = false;
		if (request.getEmail() != null && StringUtils.hasText(request.getEmail())) {
			String normalized = request.getEmail().trim().toLowerCase();
			if (!normalized.equalsIgnoreCase(user.getEmail())) {
				if (userRepository.existsByEmailIgnoreCase(normalized)) {
					throw new EmailAlreadyRegisteredException(normalized);
				}
				user.setEmail(normalized);
				emailChanged = true;
			}
		}
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
		User saved = userRepository.save(user);
		UserProfileDto dto = toProfileDto(saved);
		String newToken = emailChanged ? jwtService.generateToken(saved) : null;
		return new ProfilePatchResponse(dto, newToken);
	}

	@Transactional
	public void changePassword(String email, ChangePasswordRequest request) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
		}
		if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"New password must be different from your current password");
		}
		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	@Transactional
	public UserProfileDto uploadAvatar(String email, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
		}
		if (file.getSize() > MAX_AVATAR_BYTES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be 2 MB or smaller");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_AVATAR_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use JPEG, PNG, WebP, or GIF");
		}
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		deleteStoredAvatarIfAny(user.getProfilePicture());
		String ext = extensionFor(contentType.toLowerCase(Locale.ROOT));
		String fileName = UUID.randomUUID() + ext;
		Path destination = AVATAR_STORAGE_DIR.resolve(fileName);
		try {
			Files.createDirectories(AVATAR_STORAGE_DIR);
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
		}
		user.setProfilePicture(AVATAR_WEB_PREFIX + fileName);
		return toProfileDto(userRepository.save(user));
	}

	@Transactional
	public UserProfileDto clearAvatar(String email) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		deleteStoredAvatarIfAny(user.getProfilePicture());
		user.setProfilePicture(null);
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
				user.getLocation(),
				user.getProfilePicture(),
				hasAvatar(user));
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
				user.getLocation(),
				user.getProfilePicture(),
				hasAvatar(user));
	}

	private static boolean hasAvatar(User user) {
		return StringUtils.hasText(user.getProfilePicture());
	}

	private static String extensionFor(String contentType) {
		return switch (contentType) {
			case "image/jpeg" -> ".jpg";
			case "image/png" -> ".png";
			case "image/webp" -> ".webp";
			case "image/gif" -> ".gif";
			default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported file type");
		};
	}

	private static void deleteStoredAvatarIfAny(String profilePicturePath) {
		if (!StringUtils.hasText(profilePicturePath)) return;
		if (!profilePicturePath.startsWith(AVATAR_WEB_PREFIX)) return;
		String fileName = profilePicturePath.substring(AVATAR_WEB_PREFIX.length());
		if (fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) return;
		Path filePath = AVATAR_STORAGE_DIR.resolve(fileName).normalize();
		if (!filePath.startsWith(AVATAR_STORAGE_DIR.normalize())) return;
		try {
			Files.deleteIfExists(filePath);
		} catch (IOException ignored) {
			// Non-fatal: keep DB update path stable even if filesystem cleanup fails.
		}
	}
}
