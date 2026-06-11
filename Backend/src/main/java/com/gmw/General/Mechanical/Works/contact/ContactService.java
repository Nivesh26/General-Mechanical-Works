package com.gmw.General.Mechanical.Works.contact;

import org.springframework.stereotype.Service;

import com.gmw.General.Mechanical.Works.auth.EmailService;

@Service
public class ContactService {

	private final EmailService emailService;

	public ContactService(EmailService emailService) {
		this.emailService = emailService;
	}

	public void sendMessage(ContactMessageRequest request) {
		emailService.sendContactMessage(
				request.getName().trim(),
				request.getPhone().trim(),
				request.getEmail().trim().toLowerCase(),
				request.getMessage().trim());
	}
}
