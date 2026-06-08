package com.gmw.General.Mechanical.Works.auth;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.user.User;

@Service
public class LoginOtpService {

	private static final int OTP_LENGTH = 6;
	private static final long OTP_TTL_SECONDS = 600;
	private static final long RESEND_COOLDOWN_SECONDS = 60;

	private final SecureRandom random = new SecureRandom();
	private final OtpRepository otpRepository;

	public LoginOtpService(OtpRepository otpRepository) {
		this.otpRepository = otpRepository;
	}

	@Transactional
	public PendingLogin create(User user) {
		otpRepository.deleteByUserId(user.getId());

		LocalDateTime now = LocalDateTime.now();
		String code = generateCode();
		String token = UUID.randomUUID().toString();

		Otp otp = new Otp();
		otp.setVerificationToken(token);
		otp.setUser(user);
		otp.setEmail(user.getEmail());
		otp.setCode(code);
		otp.setExpiresAt(now.plusSeconds(OTP_TTL_SECONDS));
		otp.setLastSentAt(now);
		otpRepository.save(otp);

		return toPendingLogin(otp);
	}

	@Transactional
	public PendingLogin resend(String verificationToken) {
		Otp otp = getValidOtp(verificationToken);
		LocalDateTime now = LocalDateTime.now();
		if (otp.getLastSentAt().plusSeconds(RESEND_COOLDOWN_SECONDS).isAfter(now)) {
			throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS,
					"Please wait before requesting another code");
		}

		otp.setCode(generateCode());
		otp.setExpiresAt(now.plusSeconds(OTP_TTL_SECONDS));
		otp.setLastSentAt(now);
		otpRepository.save(otp);

		return toPendingLogin(otp);
	}

	@Transactional
	public PendingLogin verify(String verificationToken, String code) {
		Otp otp = getValidOtp(verificationToken);
		if (!otp.getCode().equals(code.trim())) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid verification code");
		}
		otpRepository.delete(otp);
		return toPendingLogin(otp);
	}

	private Otp getValidOtp(String verificationToken) {
		Otp otp = otpRepository.findByVerificationToken(verificationToken)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
						"Verification session expired. Please sign in again."));
		if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
			otpRepository.delete(otp);
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
					"Verification code expired. Please sign in again.");
		}
		return otp;
	}

	private static PendingLogin toPendingLogin(Otp otp) {
		return new PendingLogin(
				otp.getVerificationToken(),
				otp.getEmail(),
				otp.getUser().getId(),
				otp.getCode(),
				otp.getExpiresAt(),
				otp.getLastSentAt());
	}

	private String generateCode() {
		int value = random.nextInt(1_000_000);
		return String.format("%0" + OTP_LENGTH + "d", value);
	}

	public record PendingLogin(
			String verificationToken,
			String email,
			Long userId,
			String code,
			LocalDateTime expiresAt,
			LocalDateTime lastSentAt) {
	}
}
