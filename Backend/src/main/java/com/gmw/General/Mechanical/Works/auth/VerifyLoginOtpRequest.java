package com.gmw.General.Mechanical.Works.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyLoginOtpRequest {

	@NotBlank
	private String verificationToken;

	@NotBlank
	@Pattern(regexp = "\\d{6}", message = "Code must be exactly 6 digits")
	private String code;

	public String getVerificationToken() {
		return verificationToken;
	}

	public void setVerificationToken(String verificationToken) {
		this.verificationToken = verificationToken;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}
}
