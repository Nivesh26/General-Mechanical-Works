package com.gmw.General.Mechanical.Works.mail;

import java.time.Year;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.gmw.General.Mechanical.Works.config.EmailProperties;
import com.gmw.General.Mechanical.Works.payment.AppUrlProperties;

@Component
public class MailTemplateRenderer {

	private final SpringTemplateEngine templateEngine;
	private final EmailProperties emailProperties;
	private final AppUrlProperties appUrlProperties;

	public MailTemplateRenderer(
			SpringTemplateEngine templateEngine,
			EmailProperties emailProperties,
			AppUrlProperties appUrlProperties) {
		this.templateEngine = templateEngine;
		this.emailProperties = emailProperties;
		this.appUrlProperties = appUrlProperties;
	}

	public RenderedMail renderLoginVerification(String code) {
		String subject = "Your " + emailProperties.getBrandName() + " login code";
		Context context = baseContext(subject, "Your login code is " + code);
		context.setVariable("code", code);
		return new RenderedMail(
				subject,
				templateEngine.process("email/login-verification", context),
				plainLoginVerification(code));
	}

	public RenderedMail renderWelcome(String name) {
		String greeting = (name != null && !name.isBlank()) ? "Hi " + name.trim() + "," : "Hi,";
		String subject = "Welcome to " + emailProperties.getBrandName();
		Context context = baseContext(subject, "Welcome to " + emailProperties.getBrandName());
		context.setVariable("greeting", greeting);
		return new RenderedMail(
				subject,
				templateEngine.process("email/welcome", context),
				plainWelcome(greeting));
	}

	public RenderedMail renderPasswordReset(String code) {
		String subject = "Reset your " + emailProperties.getBrandName() + " password";
		Context context = baseContext(subject, "Your password reset code is " + code);
		context.setVariable("code", code);
		return new RenderedMail(
				subject,
				templateEngine.process("email/password-reset", context),
				plainPasswordReset(code));
	}

	public RenderedMail renderContactMessage(String name, String phone, String senderEmail, String message) {
		String subject = "New contact message from " + name;
		Context context = baseContext(subject, "New contact form message from " + name);
		context.setVariable("senderName", name);
		context.setVariable("senderPhone", phone);
		context.setVariable("senderEmail", senderEmail);
		context.setVariable("messageBody", message);
		return new RenderedMail(
				subject,
				templateEngine.process("email/contact-message", context),
				plainContactMessage(name, phone, senderEmail, message));
	}

	public RenderedMail renderOrderConfirmation(OrderConfirmationMailMapper.OrderConfirmationView order) {
		String subject = "Order confirmed — " + order.orderNumber();
		Context context = baseContext(
				subject,
				"Your order " + order.orderNumber() + " is confirmed. Delivery within 3 business days.");
		populateOrderContext(context, order);
		context.setVariable("orderTrackingUrl", frontendUrl() + "/ordertracking");
		context.setVariable("helpCenterUrl", frontendUrl() + "/contactus");
		return new RenderedMail(
				subject,
				templateEngine.process("email/order-confirmation", context),
				plainOrderConfirmation(order));
	}

	public RenderedMail renderOrderAdminNotification(OrderConfirmationMailMapper.OrderConfirmationView order) {
		String subject = "New order " + order.orderNumber() + " from " + order.customerName();
		Context context = baseContext(
				subject,
				order.customerName() + " placed order " + order.orderNumber() + " via " + order.paymentMethodLabel());
		populateOrderContext(context, order);
		return new RenderedMail(
				subject,
				templateEngine.process("email/order-admin-notification", context),
				plainOrderAdminNotification(order));
	}

	private void populateOrderContext(Context context, OrderConfirmationMailMapper.OrderConfirmationView order) {
		context.setVariable("orderNumber", order.orderNumber());
		context.setVariable("customerName", order.customerName());
		context.setVariable("customerEmail", order.customerEmail());
		context.setVariable("phone", order.phone());
		context.setVariable("address", order.address());
		context.setVariable("paymentMethodLabel", order.paymentMethodLabel());
		context.setVariable("subtotal", order.subtotal());
		context.setVariable("taxAmount", order.taxAmount());
		context.setVariable("total", order.total());
		context.setVariable("lines", order.lines());
	}

	private String frontendUrl() {
		return trimTrailingSlash(appUrlProperties.getFrontendUrl());
	}

	private Context baseContext(String subject, String preheader) {
		Context context = new Context();
		context.setVariables(baseVariables(subject, preheader));
		return context;
	}

	private Map<String, Object> baseVariables(String subject, String preheader) {
		Map<String, Object> variables = new HashMap<>();
		variables.put("subject", subject);
		variables.put("preheader", preheader);
		variables.put("brandName", emailProperties.getBrandName());
		variables.put("brandAddress", emailProperties.getBrandAddress());
		variables.put("brandPhone", emailProperties.getBrandPhone());
		variables.put("websiteUrl", trimTrailingSlash(appUrlProperties.getFrontendUrl()));
		variables.put("websiteLabel", "Visit our website");
		variables.put("year", Year.now().getValue());
		return variables;
	}

	private static String plainLoginVerification(String code) {
		return """
				Your login verification code is: %s

				This code expires in 10 minutes. If you did not try to sign in, you can ignore this email.
				""".formatted(code);
	}

	private String plainWelcome(String greeting) {
		return """
				%s

				Welcome to %s!

				Thank you for creating an account with us. We're glad to have you on board.
				""".formatted(greeting, emailProperties.getBrandName());
	}

	private static String plainPasswordReset(String code) {
		return """
				Your password reset code is: %s

				This code expires in 10 minutes. If you did not request a password reset, you can ignore this email.
				""".formatted(code);
	}

	private static String plainContactMessage(String name, String phone, String senderEmail, String message) {
		return """
				You received a new message from the contact form.

				Name: %s
				Phone: %s
				Email: %s

				Message:
				%s
				""".formatted(name, phone, senderEmail, message);
	}

	private static String plainOrderConfirmation(OrderConfirmationMailMapper.OrderConfirmationView order) {
		StringBuilder items = new StringBuilder();
		for (OrderConfirmationMailMapper.OrderLineView line : order.lines()) {
			items.append("- ")
					.append(line.productName())
					.append(" (Qty ")
					.append(line.quantity())
					.append(") — ")
					.append(line.lineTotal())
					.append('\n');
		}
		return """
				Thank you for your order, %s!

				Order: %s
				Payment: %s
				Total: %s

				Your product(s) will be delivered within 3 business days.

				Items:
				%s
				Delivery Details
				Name: %s
				Email: %s
				Phone: %s
				Address: %s

				Track your order: %s
				Help Center: %s
				""".formatted(
				order.customerName(),
				order.orderNumber(),
				order.paymentMethodLabel(),
				order.total(),
				items.toString().trim(),
				order.customerName(),
				order.customerEmail(),
				order.phone(),
				order.address(),
				"order tracking on website",
				"contact us on website");
	}

	private static String plainOrderAdminNotification(OrderConfirmationMailMapper.OrderConfirmationView order) {
		return """
				New order from %s (%s)

				Order: %s
				Payment: %s
				Total: %s
				Phone: %s
				Address: %s
				""".formatted(
				order.customerName(),
				order.customerEmail(),
				order.orderNumber(),
				order.paymentMethodLabel(),
				order.total(),
				order.phone(),
				order.address());
	}

	private static String trimTrailingSlash(String url) {
		if (url == null || url.isBlank()) {
			return "http://localhost:5173";
		}
		return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
	}

	public record RenderedMail(String subject, String htmlBody, String plainTextBody) {
	}
}
