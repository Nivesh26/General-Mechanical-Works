package com.gmw.General.Mechanical.Works.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OtpRepository extends JpaRepository<Otp, Long> {

	@Query("SELECT o FROM Otp o JOIN FETCH o.user WHERE o.verificationToken = :token")
	Optional<Otp> findByVerificationToken(@Param("token") String verificationToken);

	void deleteByUserId(Long userId);
}
