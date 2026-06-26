package com.gmw.General.Mechanical.Works.mail;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.appointment.AppointmentMode;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointment;
import com.gmw.General.Mechanical.Works.user.User;

@Component
public class AppointmentMailMapper {

	private static final DateTimeFormatter DATE_FORMAT =
			DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

	public AppointmentMailView toView(ServiceAppointment appointment) {
		User user = appointment.getUser();
		return new AppointmentMailView(
				"APT-" + appointment.getId(),
				user.getName(),
				user.getEmail(),
				displayValue(user.getPhone(), "—"),
				appointment.getServiceTitles(),
				appointment.getAppointmentDate().format(DATE_FORMAT),
				appointment.getTimeSlot(),
				appointment.getBikeLabel(),
				displayValue(appointment.getNotes(), "—"),
				modeLabel(appointment.getMode()));
	}

	private static String modeLabel(AppointmentMode mode) {
		return mode == AppointmentMode.PICKUP ? "Pickup service" : "Workshop visit";
	}

	private static String displayValue(String value, String fallback) {
		return StringUtils.hasText(value) ? value.trim() : fallback;
	}

	public record AppointmentMailView(
			String appointmentNumber,
			String customerName,
			String customerEmail,
			String customerPhone,
			String serviceTitles,
			String appointmentDate,
			String timeSlot,
			String bikeLabel,
			String notes,
			String modeLabel) {
	}

}
