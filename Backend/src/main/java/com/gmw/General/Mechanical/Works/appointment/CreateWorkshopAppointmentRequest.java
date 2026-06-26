package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateWorkshopAppointmentRequest(
		@NotEmpty @Size(min = 1, max = 3) List<@NotBlank String> serviceIds,
		@NotNull LocalDate date,
		@NotBlank String timeSlot,
		@NotNull Long vehicleId,
		String notes) {
}
