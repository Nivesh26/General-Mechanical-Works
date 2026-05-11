package com.gmw.General.Mechanical.Works.auth;

import java.time.LocalDate;

import com.gmw.General.Mechanical.Works.user.Gender;
import com.gmw.General.Mechanical.Works.user.Role;

public record AuthResponse(
		String accessToken,
		String tokenType,
		Long id,
		String name,
		String email,
		String phone,
		Role role,
		Gender gender,
		LocalDate dateOfBirth,
		String location,
		String profilePicture,
		boolean hasAvatar
) {
}
