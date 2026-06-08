package com.gmw.General.Mechanical.Works.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AuthStartupWarmup {

	private static final Logger log = LoggerFactory.getLogger(AuthStartupWarmup.class);

	private final PasswordEncoder passwordEncoder;
	private final JavaMailSender mailSender;

	public AuthStartupWarmup(PasswordEncoder passwordEncoder, JavaMailSender mailSender) {
		this.passwordEncoder = passwordEncoder;
		this.mailSender = mailSender;
	}

	@EventListener(ApplicationReadyEvent.class)
	@Async("mailTaskExecutor")
	public void warmUp() {
		passwordEncoder.encode("startup-warmup");
		if (mailSender instanceof JavaMailSenderImpl impl) {
			try {
				impl.testConnection();
			} catch (Exception ex) {
				log.debug("Mail warm-up skipped: {}", ex.getMessage());
			}
		}
	}
}
