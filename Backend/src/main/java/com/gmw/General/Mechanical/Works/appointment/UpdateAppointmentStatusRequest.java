package com.gmw.General.Mechanical.Works.appointment;

import jakarta.validation.constraints.NotNull;

public record UpdateAppointmentStatusRequest(@NotNull AppointmentStatus status) {
}
