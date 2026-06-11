package com.gmw.General.Mechanical.Works.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ContactMessageRequest {

	@NotBlank
	@Size(min = 2, max = 120)
	private String name;

	@NotBlank
	@Size(max = 32)
	private String phone;

	@NotBlank
	@Email
	private String email;

	@NotBlank
	@Size(min = 10, max = 2000)
	private String message;

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}
}
