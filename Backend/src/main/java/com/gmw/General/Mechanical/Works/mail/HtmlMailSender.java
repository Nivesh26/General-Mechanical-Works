package com.gmw.General.Mechanical.Works.mail;

import org.springframework.core.io.ClassPathResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import com.gmw.General.Mechanical.Works.config.EmailProperties;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

@Component
public class HtmlMailSender {

	private static final String LOGO_CID = "gmw-logo";
	private static final ClassPathResource LOGO_RESOURCE = new ClassPathResource("email/gmw-logo.png");

	private final JavaMailSender mailSender;
	private final EmailProperties emailProperties;

	public HtmlMailSender(JavaMailSender mailSender, EmailProperties emailProperties) {
		this.mailSender = mailSender;
		this.emailProperties = emailProperties;
	}

	public void send(String to, MailTemplateRenderer.RenderedMail mail) throws Exception {
		send(to, null, mail);
	}

	public void send(String to, String replyTo, MailTemplateRenderer.RenderedMail mail) throws Exception {
		MimeMessage mimeMessage = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
		helper.setFrom(new InternetAddress(emailProperties.getFrom(), emailProperties.getBrandName()));
		helper.setTo(to);
		if (replyTo != null && !replyTo.isBlank()) {
			helper.setReplyTo(replyTo);
		}
		helper.setSubject(mail.subject());
		helper.setText(mail.plainTextBody(), mail.htmlBody());
		if (LOGO_RESOURCE.exists()) {
			helper.addInline(LOGO_CID, LOGO_RESOURCE);
		}
		mailSender.send(mimeMessage);
	}
}
