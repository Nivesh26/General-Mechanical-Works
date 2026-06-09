package com.gmw.General.Mechanical.Works.auth;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
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

	@Async("mailTaskExecutor")
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

	@Async("mailTaskExecutor")
	public void sendWelcomeEmail(String toEmail, String name) {
		String greeting = (name != null && !name.isBlank()) ? "Hi " + name.trim() + "," : "Hi,";
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(emailProperties.getFrom());
		message.setTo(toEmail);
		message.setSubject("Welcome to General Mechanical Works");
		message.setText("""
				%s

				Welcome to General Mechanical Works!

				Thank you for creating an account with us. We're glad to have you on board.

				— General Mechanical Works
				""".formatted(greeting));
		mailSender.send(message);
	}

	@Async("mailTaskExecutor")
	public void sendPasswordResetCode(String toEmail, String code) {
		SimpleMailMessage message = new SimpleMailMessage();
		message.setFrom(emailProperties.getFrom());
		message.setTo(toEmail);
		message.setSubject("Your General Mechanical Works password reset code");
		message.setText("""
				Your password reset code is: %s

				This code expires in 10 minutes. If you did not request a password reset, you can ignore this email.

				— General Mechanical Works
				""".formatted(code));
		mailSender.send(message);
	}
}
