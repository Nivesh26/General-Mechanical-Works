package com.gmw.General.Mechanical.Works.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OtpRepository extends JpaRepository<Otp, Long> {

	Optional<Otp> findByVerificationToken(String verificationToken);

	void deleteByUserId(Long userId);
}
