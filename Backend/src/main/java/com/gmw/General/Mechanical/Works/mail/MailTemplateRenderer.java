package com.gmw.General.Mechanical.Works.mail;

import java.time.Year;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

import org.springframework.stereotype.Component;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import com.gmw.General.Mechanical.Works.config.EmailProperties;
import com.gmw.General.Mechanical.Works.appointment.AppointmentStatus;
import com.gmw.General.Mechanical.Works.order.OrderStatus;
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

	public RenderedMail renderOrderStatusUpdate(
			OrderConfirmationMailMapper.OrderConfirmationView order,
			OrderStatus status) {
		StatusCopy copy = statusCopy(status);
		String subject = copy.statusTag() + " — " + order.orderNumber();
		Context context = baseContext(subject, copy.preheader() + " " + order.orderNumber());
		populateOrderContext(context, order);
		context.setVariable("statusTag", copy.statusTag());
		context.setVariable("headline", copy.headline());
		context.setVariable("statusLabel", copy.statusLabel());
		context.setVariable("statusMessage", copy.statusMessage());
		context.setVariable("orderTrackingUrl", frontendUrl() + "/ordertracking");
		context.setVariable("helpCenterUrl", frontendUrl() + "/contactus");
		return new RenderedMail(
				subject,
				templateEngine.process("email/order-status-update", context),
				plainOrderStatusUpdate(order, copy));
	}

	public RenderedMail renderAppointmentBooked(AppointmentMailMapper.AppointmentMailView appointment) {
		boolean pickup = isPickup(appointment);
		String subject = (pickup ? "Pickup service booked" : "Workshop visit booked")
				+ " — " + appointment.appointmentNumber();
		String preheader = "Your appointment " + appointment.appointmentNumber() + " is pending confirmation.";
		Context context = baseContext(subject, preheader);
		populateAppointmentContext(context, appointment);
		context.setVariable("statusTag", "Pending");
		context.setVariable(
				"headline",
				"Your " + appointment.modeLabel().toLowerCase(Locale.ROOT) + " is booked");
		context.setVariable(
				"statusMessage",
				pickup
						? "Thank you for booking pickup service. Your request is pending. "
								+ "We will email you again once it has been accepted or declined."
						: "Thank you for booking with us. Your appointment is currently pending. "
								+ "We will email you again once it has been accepted or declined.");
		context.setVariable("servicesUrl", frontendUrl() + "/service");
		context.setVariable("helpCenterUrl", frontendUrl() + "/contactus");
		return new RenderedMail(
				subject,
				templateEngine.process("email/appointment-booked", context),
				plainAppointmentBooked(appointment));
	}

	public RenderedMail renderAppointmentStatusUpdate(
			AppointmentMailMapper.AppointmentMailView appointment,
			AppointmentStatus status) {
		AppointmentStatusCopy copy = appointmentStatusCopy(status, isPickup(appointment));
		String subject = copy.statusTag() + " — " + appointment.appointmentNumber();
		Context context = baseContext(subject, copy.preheader() + " " + appointment.appointmentNumber());
		populateAppointmentContext(context, appointment);
		context.setVariable("statusTag", copy.statusTag());
		context.setVariable("headline", copy.headline());
		context.setVariable("statusLabel", copy.statusLabel());
		context.setVariable("statusMessage", copy.statusMessage());
		context.setVariable("statusBoxStyle", copy.statusBoxStyle());
		context.setVariable("statusTextStyle", copy.statusTextStyle());
		context.setVariable("helpCenterUrl", frontendUrl() + "/contactus");
		return new RenderedMail(
				subject,
				templateEngine.process("email/appointment-status-update", context),
				plainAppointmentStatusUpdate(appointment, copy));
	}

	private static AppointmentStatusCopy appointmentStatusCopy(AppointmentStatus status, boolean pickup) {
		return switch (status) {
			case ACCEPTED -> pickup
					? new AppointmentStatusCopy(
							"Team on the way",
							"We are on the way",
							"On the way",
							"Great news! We have accepted your pickup request and our team is on the way to your location.",
							"margin:0 0 24px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;",
							"padding:14px 16px;font-size:14px;line-height:1.6;color:#166534;",
							"Our team is on the way to your pickup location.")
					: new AppointmentStatusCopy(
							"Appointment accepted",
							"Your appointment has been accepted",
							"Accepted",
							"Great news! We have accepted your service appointment. Please bring your bike at the scheduled date and time.",
							"margin:0 0 24px;background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;",
							"padding:14px 16px;font-size:14px;line-height:1.6;color:#166534;",
							"Your appointment has been accepted.");
			case DECLINED -> new AppointmentStatusCopy(
					"Appointment declined",
					"Your appointment was declined",
					"Declined",
					"We're sorry — we could not accept this appointment slot. Please book another date or contact us for help.",
					"margin:0 0 24px;background-color:#fef2f2;border:1px solid #fecaca;border-radius:10px;",
					"padding:14px 16px;font-size:14px;line-height:1.6;color:#b91c1c;",
					"Your appointment was declined.");
			case CANCELLED -> new AppointmentStatusCopy(
					"Appointment cancelled",
					"Your appointment has been cancelled",
					"Cancelled",
					pickup
							? "You cancelled this pickup appointment. You can book a new pickup or workshop visit anytime from our website."
							: "You cancelled this service appointment. You can book a new workshop visit anytime from our website.",
					"margin:0 0 24px;background-color:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;",
					"padding:14px 16px;font-size:14px;line-height:1.6;color:#475569;",
					"Your appointment has been cancelled.");
			case COMPLETED -> pickup
					? new AppointmentStatusCopy(
							"Pickup complete",
							"Your pickup service is done",
							"Done",
							"Your pickup service is complete. Thank you for choosing us!",
							"margin:0 0 24px;background-color:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;",
							"padding:14px 16px;font-size:14px;line-height:1.6;color:#4338ca;",
							"Your pickup service is done.")
					: new AppointmentStatusCopy(
							"Appointment completed",
							"Your service appointment is complete",
							"Completed",
							"Your workshop visit has been marked as completed. Thank you for choosing us!",
							"margin:0 0 24px;background-color:#eef2ff;border:1px solid #c7d2fe;border-radius:10px;",
							"padding:14px 16px;font-size:14px;line-height:1.6;color:#4338ca;",
							"Your appointment has been completed.");
			case PENDING -> throw new IllegalArgumentException("Unsupported appointment status email: " + status);
		};
	}

	private record AppointmentStatusCopy(
			String statusTag,
			String headline,
			String statusLabel,
			String statusMessage,
			String statusBoxStyle,
			String statusTextStyle,
			String preheader) {
	}

	private static boolean isPickup(AppointmentMailMapper.AppointmentMailView appointment) {
		return "Pickup service".equals(appointment.modeLabel());
	}

	private void populateAppointmentContext(Context context, AppointmentMailMapper.AppointmentMailView appointment) {
		context.setVariable("appointmentNumber", appointment.appointmentNumber());
		context.setVariable("customerName", appointment.customerName());
		context.setVariable("customerEmail", appointment.customerEmail());
		context.setVariable("customerPhone", appointment.customerPhone());
		context.setVariable("serviceTitles", appointment.serviceTitles());
		context.setVariable("appointmentDate", appointment.appointmentDate());
		context.setVariable("timeSlot", appointment.timeSlot());
		context.setVariable("bikeLabel", appointment.bikeLabel());
		context.setVariable("notes", appointment.notes());
		context.setVariable("modeLabel", appointment.modeLabel());
		context.setVariable("pickupLocationLabel", appointment.pickupLocationLabel());
		context.setVariable("pickupLocationUrl", appointment.pickupLocationUrl());
		context.setVariable("hasPickupLocation", appointment.pickupLocationUrl() != null);
	}

	private static String plainAppointmentBooked(AppointmentMailMapper.AppointmentMailView appointment) {
		String pickupLine = appointment.pickupLocationLabel() != null
				? "\nPickup location: " + appointment.pickupLocationLabel()
						+ (appointment.pickupLocationUrl() != null ? "\nMap: " + appointment.pickupLocationUrl() : "")
				: "";
		String pendingMessage = isPickup(appointment)
				? "We have received your pickup booking. Your appointment is pending confirmation. We will email you once it is accepted or declined."
				: "We have received your booking. Your appointment is pending confirmation. We will email you once it is accepted or declined.";
		return """
				Hi %s,

				Your service appointment is booked.

				Appointment: %s
				Status: Pending
				Mode: %s
				Services: %s
				Date: %s
				Time: %s
				Bike: %s
				Notes: %s%s

				%s
				""".formatted(
				appointment.customerName(),
				appointment.appointmentNumber(),
				appointment.modeLabel(),
				appointment.serviceTitles(),
				appointment.appointmentDate(),
				appointment.timeSlot(),
				appointment.bikeLabel(),
				appointment.notes(),
				pickupLine,
				pendingMessage);
	}

	private static String plainAppointmentStatusUpdate(
			AppointmentMailMapper.AppointmentMailView appointment,
			AppointmentStatusCopy copy) {
		return """
				Hi %s,

				%s
				Appointment: %s
				Status: %s
				Mode: %s
				Services: %s
				Date: %s
				Time: %s
				Bike: %s

				%s
				""".formatted(
				appointment.customerName(),
				copy.headline(),
				appointment.appointmentNumber(),
				copy.statusLabel(),
				appointment.modeLabel(),
				appointment.serviceTitles(),
				appointment.appointmentDate(),
				appointment.timeSlot(),
				appointment.bikeLabel(),
				copy.statusMessage());
	}

	private static StatusCopy statusCopy(OrderStatus status) {
		return switch (status) {
			case CONFIRMED -> new StatusCopy(
					"Order confirmed",
					"Your order has been confirmed",
					"Confirmed",
					"We have confirmed your order and are preparing your items for shipment. Expected delivery within 3 business days.",
					"Your order has been confirmed and is being prepared.");
			case SHIPPED -> new StatusCopy(
					"Order shipped",
					"Your order is on the way",
					"Shipped",
					"Great news! Your order has been shipped and is on its way to your delivery address.",
					"Your order has been shipped and is on the way.");
			case DELIVERED -> new StatusCopy(
					"Order delivered",
					"Your order has been delivered",
					"Delivered",
					"Your order has been delivered. We hope you enjoy your purchase! Thank you for shopping with us.",
					"Your order has been delivered.");
			case PENDING, CANCELLED -> throw new IllegalArgumentException("Unsupported order status email: " + status);
		};
	}

	private record StatusCopy(
			String statusTag,
			String headline,
			String statusLabel,
			String statusMessage,
			String preheader) {
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

	private static String plainOrderStatusUpdate(
			OrderConfirmationMailMapper.OrderConfirmationView order,
			StatusCopy copy) {
		return """
				Hi %s,

				%s
				Order: %s
				Status: %s
				Payment: %s
				Total: %s

				%s

				Delivery Details
				Name: %s
				Email: %s
				Phone: %s
				Address: %s
				""".formatted(
				order.customerName(),
				copy.headline(),
				order.orderNumber(),
				copy.statusLabel(),
				order.paymentMethodLabel(),
				order.total(),
				copy.statusMessage(),
				order.customerName(),
				order.customerEmail(),
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
