package com.gmw.General.Mechanical.Works.auth;

import jakarta.validation.constraints.NotBlank;

public class GoogleAuthRequest {

	@NotBlank(message = "idToken is required")
	private String idToken;

	public String getIdToken() {
		return idToken;
	}

	public void setIdToken(String idToken) {
		this.idToken = idToken;
	}
}
