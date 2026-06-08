package com.gmw.General.Mechanical.Works.auth;

public record LoginPendingResponse(
		boolean verificationRequired,
		String verificationToken,
		String email
) {
}
