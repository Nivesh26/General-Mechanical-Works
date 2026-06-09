package com.gmw.General.Mechanical.Works.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class ResetPasswordRequest {

	@NotBlank
	private String verificationToken;

	@NotBlank
	@Pattern(regexp = "\\d{6}", message = "Code must be exactly 6 digits")
	private String code;

	@NotBlank
	@Size(min = 8, max = 128)
	private String newPassword;

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

	public String getNewPassword() {
		return newPassword;
	}

	public void setNewPassword(String newPassword) {
		this.newPassword = newPassword;
	}
}
