package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

public record UpsertServiceAvailabilityRequest(
		@NotNull LocalDate date,
		@NotEmpty List<String> slots) {
}
