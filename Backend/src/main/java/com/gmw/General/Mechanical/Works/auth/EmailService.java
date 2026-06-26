package com.gmw.General.Mechanical.Works.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.gmw.General.Mechanical.Works.config.EmailProperties;
import com.gmw.General.Mechanical.Works.mail.HtmlMailSender;
import com.gmw.General.Mechanical.Works.mail.AppointmentMailMapper.AppointmentMailView;
import com.gmw.General.Mechanical.Works.mail.MailTemplateRenderer;
import com.gmw.General.Mechanical.Works.mail.OrderConfirmationMailMapper.OrderConfirmationView;
import com.gmw.General.Mechanical.Works.appointment.AppointmentStatus;
import com.gmw.General.Mechanical.Works.order.OrderStatus;

@Service
public class EmailService {

	private static final Logger log = LoggerFactory.getLogger(EmailService.class);

	private final HtmlMailSender htmlMailSender;
	private final MailTemplateRenderer mailTemplateRenderer;
	private final EmailProperties emailProperties;

	public EmailService(
			HtmlMailSender htmlMailSender,
			MailTemplateRenderer mailTemplateRenderer,
			EmailProperties emailProperties) {
		this.htmlMailSender = htmlMailSender;
		this.mailTemplateRenderer = mailTemplateRenderer;
		this.emailProperties = emailProperties;
	}

	@Async("mailTaskExecutor")
	public void sendLoginVerificationCode(String toEmail, String code) {
		sendRendered(toEmail, null, mailTemplateRenderer.renderLoginVerification(code));
	}

	@Async("mailTaskExecutor")
	public void sendWelcomeEmail(String toEmail, String name) {
		sendRendered(toEmail, null, mailTemplateRenderer.renderWelcome(name));
	}

	@Async("mailTaskExecutor")
	public void sendPasswordResetCode(String toEmail, String code) {
		sendRendered(toEmail, null, mailTemplateRenderer.renderPasswordReset(code));
	}

	@Async("mailTaskExecutor")
	public void sendContactMessage(String name, String phone, String senderEmail, String message) {
		sendRendered(
				emailProperties.getFrom(),
				senderEmail,
				mailTemplateRenderer.renderContactMessage(name, phone, senderEmail, message));
	}

	@Async("mailTaskExecutor")
	public void sendOrderConfirmation(OrderConfirmationView order) {
		sendRendered(order.customerEmail(), null, mailTemplateRenderer.renderOrderConfirmation(order));
		sendRendered(emailProperties.getFrom(), order.customerEmail(), mailTemplateRenderer.renderOrderAdminNotification(order));
	}

	@Async("mailTaskExecutor")
	public void sendOrderStatusUpdate(OrderConfirmationView order, OrderStatus status) {
		sendRendered(order.customerEmail(), null, mailTemplateRenderer.renderOrderStatusUpdate(order, status));
	}

	@Async("mailTaskExecutor")
	public void sendAppointmentBooked(AppointmentMailView appointment) {
		sendRendered(appointment.customerEmail(), null, mailTemplateRenderer.renderAppointmentBooked(appointment));
	}

	@Async("mailTaskExecutor")
	public void sendAppointmentStatusUpdate(AppointmentMailView appointment, AppointmentStatus status) {
		sendRendered(
				appointment.customerEmail(),
				null,
				mailTemplateRenderer.renderAppointmentStatusUpdate(appointment, status));
	}

	private void sendRendered(String to, String replyTo, MailTemplateRenderer.RenderedMail mail) {
		try {
			htmlMailSender.send(to, replyTo, mail);
		} catch (Exception ex) {
			log.error("Failed to send email to {}: {}", to, ex.getMessage());
		}
	}
}
