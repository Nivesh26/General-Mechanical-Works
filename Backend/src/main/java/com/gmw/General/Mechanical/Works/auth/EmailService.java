package com.gmw.General.Mechanical.Works.auth;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.gmw.General.Mechanical.Works.config.EmailProperties;

@Service
public class EmailService {

	private final JavaMailSender mailSender;
	private final EmailProperties emailProperties;

	public EmailService(JavaMailSender mailSender, EmailProperties emailProperties) {
		this.mailSender = mailSender;
		this.emailProperties = emailProperties;
	}

	public void sendLoginVerificationCode(String toEmail, String code) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(emailProperties.getFrom());
		message.setTo(toEmail);
		message.setSubject("Your General Mechanical Works login code");
		message.setText("""
				Your login verification code is: %s

				This code expires in 10 minutes. If you did not try to sign in, you can ignore this email.

				— General Mechanical Works
				""".formatted(code));
		mailSender.send(message);
	}
}
