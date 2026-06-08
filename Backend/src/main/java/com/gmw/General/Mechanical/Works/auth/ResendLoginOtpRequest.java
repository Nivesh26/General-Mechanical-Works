package com.gmw.General.Mechanical.Works.auth;

import jakarta.validation.constraints.NotBlank;

public class ResendLoginOtpRequest {

	@NotBlank
	private String verificationToken;

	public String getVerificationToken() {
		return verificationToken;
	}

	public void setVerificationToken(String verificationToken) {
		this.verificationToken = verificationToken;
	}
}
