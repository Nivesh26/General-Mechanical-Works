package com.gmw.General.Mechanical.Works.appointment;

import java.util.List;

public record ServiceAppointmentDto(
		Long id,
		String appointmentNumber,
		String submittedAt,
		String status,
		String mode,
		String customerName,
		String customerEmail,
		String customerPhone,
		List<String> serviceIds,
		String serviceTitle,
		String date,
		String slot,
		String bikeLabel,
		String notes) {
}
