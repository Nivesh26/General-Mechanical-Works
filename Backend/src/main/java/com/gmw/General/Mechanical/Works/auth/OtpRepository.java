package com.gmw.General.Mechanical.Works.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OtpRepository extends JpaRepository<Otp, Long> {

	@Query("SELECT o FROM Otp o JOIN FETCH o.user WHERE o.verificationToken = :token AND o.purpose = :purpose")
	Optional<Otp> findByVerificationTokenAndPurpose(
			@Param("token") String verificationToken,
			@Param("purpose") OtpPurpose purpose);

	void deleteByUserIdAndPurpose(Long userId, OtpPurpose purpose);
}
