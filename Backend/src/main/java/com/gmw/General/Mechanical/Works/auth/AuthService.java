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

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.gmw.General.Mechanical.Works.config.JwtService;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class AuthService {

	public static final int MAX_AVATAR_BYTES = 2 * 1024 * 1024;
	public static final int MAX_COVER_BYTES = 4 * 1024 * 1024;

	private static final Set<String> ALLOWED_AVATAR_CONTENT_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif");
	private static final String AVATAR_WEB_PREFIX = "/uploads/profiles/";
	private static final Path AVATAR_STORAGE_DIR = Path.of("uploads", "profiles");
	private static final String COVER_WEB_PREFIX = "/uploads/covers/";
	private static final Path COVER_STORAGE_DIR = Path.of("uploads", "covers");

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;
	private final JwtService jwtService;
	private final GoogleTokenVerifier googleTokenVerifier;
	private final LoginOtpService loginOtpService;
	private final EmailService emailService;
	private final TransactionTemplate transactionTemplate;

	public AuthService(
			UserRepository userRepository,
			PasswordEncoder passwordEncoder,
			JwtService jwtService,
			GoogleTokenVerifier googleTokenVerifier,
			LoginOtpService loginOtpService,
			EmailService emailService,
			TransactionTemplate transactionTemplate) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
		this.jwtService = jwtService;
		this.googleTokenVerifier = googleTokenVerifier;
		this.loginOtpService = loginOtpService;
		this.emailService = emailService;
		this.transactionTemplate = transactionTemplate;
	}

	public AuthResponse signup(SignupRequest request) {
		String normalizedEmail = request.getEmail().trim().toLowerCase();
		String passwordHash = passwordEncoder.encode(request.getPassword());

		User user = new User();
		user.setName(request.getName().trim());
		user.setEmail(normalizedEmail);
		user.setPasswordHash(passwordHash);
		String phone = request.getPhone();
		if (StringUtils.hasText(phone)) {
			String phoneDigits = phone.replaceAll("\\D", "");
			if (!phoneDigits.matches("\\d{10}")) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone must be exactly 10 digits");
			}
			user.setPhone(phoneDigits);
		} else {
			user.setPhone(null);
		}
		user.setRole(Role.USER);
		try {
			User saved = transactionTemplate.execute(status -> userRepository.save(user));
			runAfterCommit(() -> emailService.sendWelcomeEmail(saved.getEmail(), saved.getName()));
			return buildAuthResponse(saved);
		} catch (DataIntegrityViolationException ex) {
			throw new EmailAlreadyRegisteredException(normalizedEmail);
		}
	}

	public LoginPendingResponse login(LoginRequest request) {
		User user = authenticateWithPassword(request.getEmail(), request.getPassword());
		LoginOtpService.PendingLogin pending = loginOtpService.create(user, OtpPurpose.LOGIN);
		emailService.sendLoginVerificationCode(user.getEmail(), pending.code());
		return new LoginPendingResponse(true, pending.verificationToken(), maskEmail(user.getEmail()));
	}

	public AuthResponse verifyLoginOtp(VerifyLoginOtpRequest request) {
		User user = loginOtpService.verify(
				request.getVerificationToken(),
				request.getCode(),
				OtpPurpose.LOGIN);
		return buildAuthResponse(user);
	}

	public void resendLoginOtp(ResendLoginOtpRequest request) {
		LoginOtpService.PendingLogin pending = loginOtpService.resend(
				request.getVerificationToken(),
				OtpPurpose.LOGIN);
		emailService.sendLoginVerificationCode(pending.email(), pending.code());
	}

	public LoginPendingResponse requestPasswordReset(ForgotPasswordRequest request) {
		String normalizedEmail = request.getEmail().trim().toLowerCase();
		var userOpt = userRepository.findByEmailIgnoreCase(normalizedEmail);
		if (userOpt.isPresent() && StringUtils.hasText(userOpt.get().getPasswordHash())) {
			User user = userOpt.get();
			LoginOtpService.PendingLogin pending = loginOtpService.create(user, OtpPurpose.PASSWORD_RESET);
			emailService.sendPasswordResetCode(user.getEmail(), pending.code());
			return new LoginPendingResponse(true, pending.verificationToken(), maskEmail(user.getEmail()));
		}
		return new LoginPendingResponse(true, null, maskEmail(normalizedEmail));
	}

	public void resendPasswordResetOtp(ResendLoginOtpRequest request) {
		LoginOtpService.PendingLogin pending = loginOtpService.resend(
				request.getVerificationToken(),
				OtpPurpose.PASSWORD_RESET);
		emailService.sendPasswordResetCode(pending.email(), pending.code());
	}

	@Transactional
	public void resetPassword(ResetPasswordRequest request) {
		User user = loginOtpService.verify(
				request.getVerificationToken(),
				request.getCode(),
				OtpPurpose.PASSWORD_RESET);
		String passwordHash = user.getPasswordHash();
		if (StringUtils.hasText(passwordHash)
				&& passwordEncoder.matches(request.getNewPassword(), passwordHash)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"New password must be different from your current password");
		}
		user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
		userRepository.save(user);
	}

	private User authenticateWithPassword(String email, String password) {
		String normalizedEmail = email.trim().toLowerCase();
		User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
				.orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
		String passwordHash = user.getPasswordHash();
		if (!StringUtils.hasText(passwordHash)
				|| !passwordEncoder.matches(password, passwordHash)) {
			throw new BadCredentialsException("Invalid email or password");
		}
		return user;
	}

	private static String maskEmail(String email) {
		int at = email.indexOf('@');
		if (at <= 1) {
			return email;
		}
		return email.charAt(0) + "***" + email.substring(at);
	}

	@Transactional
	public AuthResponse loginWithGoogle(String idToken) {
		GoogleIdToken.Payload payload = googleTokenVerifier.verify(idToken);
		String googleSub = payload.getSubject();
		if (!StringUtils.hasText(googleSub)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid Google sign-in token");
		}
		Boolean emailVerified = payload.getEmailVerified();
		if (emailVerified == null || !emailVerified) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google email is not verified");
		}
		String email = payload.getEmail();
		if (!StringUtils.hasText(email)) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Google account has no email");
		}
		String normalizedEmail = email.trim().toLowerCase();

		User user = userRepository.findByGoogleSub(googleSub).orElse(null);
		if (user != null) {
			applyGooglePictureIfNoLocalUpload(user, payload);
			return buildAuthResponse(userRepository.save(user));
		}

		user = userRepository.findByEmailIgnoreCase(normalizedEmail).orElse(null);
		if (user != null) {
			String existingSub = user.getGoogleSub();
			if (StringUtils.hasText(existingSub) && !existingSub.equals(googleSub)) {
				throw new ResponseStatusException(HttpStatus.CONFLICT,
						"This email is linked to a different Google account");
			}
			user.setGoogleSub(googleSub);
			applyGoogleNameIfBlank(user, payload);
			applyGooglePictureIfNoLocalUpload(user, payload);
			return buildAuthResponse(userRepository.save(user));
		}

		User created = new User();
		created.setGoogleSub(googleSub);
		created.setEmail(normalizedEmail);
		created.setName(resolveGoogleDisplayName(payload));
		// Unusable random hash — satisfies NOT NULL DB columns; Google users sign in via Google only.
		created.setPasswordHash(passwordEncoder.encode("google-oauth:" + UUID.randomUUID()));
		created.setRole(Role.USER);
		applyGooglePictureIfNoLocalUpload(created, payload);
		User saved = userRepository.save(created);
		runAfterCommit(() -> emailService.sendWelcomeEmail(saved.getEmail(), saved.getName()));
		return buildAuthResponse(saved);
	}

	private static void runAfterCommit(Runnable action) {
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					action.run();
				}
			});
		} else {
			action.run();
		}
	}

	private static void applyGoogleNameIfBlank(User user, GoogleIdToken.Payload payload) {
		if (StringUtils.hasText(user.getName())) {
			return;
		}
		user.setName(resolveGoogleDisplayName(payload));
	}

	/** Stores Google `picture` URL; removes any previously saved local avatar from Google sync. */
	private void applyGooglePictureIfNoLocalUpload(User user, GoogleIdToken.Payload payload) {
		String picture = stringClaim(payload, "picture");
		if (!StringUtils.hasText(picture)) {
			return;
		}
		String current = user.getProfilePicture();
		if (StringUtils.hasText(current) && current.startsWith(AVATAR_WEB_PREFIX)) {
			deleteStoredFileIfAny(current, AVATAR_WEB_PREFIX, AVATAR_STORAGE_DIR);
		}
		user.setProfilePicture(picture);
	}

	private static String stringClaim(GoogleIdToken.Payload payload, String key) {
		Object value = payload.get(key);
		if (value instanceof String s && StringUtils.hasText(s)) {
			return s.trim();
		}
		return null;
	}

	private static String resolveGoogleDisplayName(GoogleIdToken.Payload payload) {
		Object name = payload.get("name");
		if (name instanceof String s && StringUtils.hasText(s)) {
			return s.trim();
		}
		String given = stringClaim(payload, "given_name");
		String family = stringClaim(payload, "family_name");
		String combined = ((given != null ? given : "") + " " + (family != null ? family : "")).trim();
		if (StringUtils.hasText(combined)) {
			return combined;
		}
		String email = payload.getEmail();
		if (StringUtils.hasText(email) && email.contains("@")) {
			return email.substring(0, email.indexOf('@'));
		}
		return "User";
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

	@Transactional(readOnly = true)
	public UserProfileDto getUserByIdForAdmin(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		if (user.getRole() != Role.USER) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return toProfileDto(user);
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
			String phoneDigits = request.getPhone().replaceAll("\\D", "");
			if (StringUtils.hasText(phoneDigits) && !phoneDigits.matches("\\d{10}")) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Phone must be exactly 10 digits");
			}
			user.setPhone(StringUtils.hasText(phoneDigits) ? phoneDigits : null);
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
		try {
			User saved = userRepository.save(user);
			UserProfileDto dto = toProfileDto(saved);
			String newToken = emailChanged ? jwtService.generateToken(saved) : null;
			return new ProfilePatchResponse(dto, newToken);
		} catch (DataIntegrityViolationException ex) {
			if (emailChanged && userRepository.existsByEmailIgnoreCase(user.getEmail())) {
				throw new EmailAlreadyRegisteredException(user.getEmail());
			}
			throw ex;
		}
	}

	@Transactional
	public void changePassword(String email, ChangePasswordRequest request) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		String passwordHash = user.getPasswordHash();
		if (!StringUtils.hasText(passwordHash)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"This account uses Google sign-in and has no password to change");
		}
		if (!passwordEncoder.matches(request.getCurrentPassword(), passwordHash)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Current password is incorrect");
		}
		if (passwordEncoder.matches(request.getNewPassword(), passwordHash)) {
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
		String webPath = storeImage(file, user.getProfilePicture(), MAX_AVATAR_BYTES, AVATAR_STORAGE_DIR, AVATAR_WEB_PREFIX);
		user.setProfilePicture(webPath);
		return toProfileDto(userRepository.save(user));
	}

	@Transactional
	public UserProfileDto uploadCoverPhoto(String email, MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
		}
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		String webPath = storeImage(file, user.getCoverPhoto(), MAX_COVER_BYTES, COVER_STORAGE_DIR, COVER_WEB_PREFIX);
		user.setCoverPhoto(webPath);
		return toProfileDto(userRepository.save(user));
	}

	@Transactional
	public UserProfileDto clearAvatar(String email) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		deleteStoredFileIfAny(user.getProfilePicture(), AVATAR_WEB_PREFIX, AVATAR_STORAGE_DIR);
		user.setProfilePicture(null);
		return toProfileDto(userRepository.save(user));
	}

	@Transactional
	public UserProfileDto clearCoverPhoto(String email) {
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		deleteStoredFileIfAny(user.getCoverPhoto(), COVER_WEB_PREFIX, COVER_STORAGE_DIR);
		user.setCoverPhoto(null);
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
				user.getCoverPhoto(),
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
				user.getCoverPhoto(),
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

	private static void deleteStoredFileIfAny(String webPath, String prefix, Path storageDir) {
		if (!StringUtils.hasText(webPath)) return;
		if (!webPath.startsWith(prefix)) return;
		String fileName = webPath.substring(prefix.length());
		if (fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) return;
		Path filePath = storageDir.resolve(fileName).normalize();
		if (!filePath.startsWith(storageDir.normalize())) return;
		try {
			Files.deleteIfExists(filePath);
		} catch (IOException ignored) {
			// Non-fatal: keep DB update path stable even if filesystem cleanup fails.
		}
	}

	private String storeImage(
			MultipartFile file,
			String currentWebPath,
			int maxBytes,
			Path storageDir,
			String webPrefix) {
		if (file.getSize() > maxBytes) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be " + (maxBytes / (1024 * 1024)) + " MB or smaller");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_AVATAR_CONTENT_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use JPEG, PNG, WebP, or GIF");
		}
		deleteStoredFileIfAny(currentWebPath, webPrefix, storageDir);
		String ext = extensionFor(contentType.toLowerCase(Locale.ROOT));
		String fileName = UUID.randomUUID() + ext;
		Path destination = storageDir.resolve(fileName);
		try {
			Files.createDirectories(storageDir);
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
		}
		return webPrefix + fileName;
	}
}
