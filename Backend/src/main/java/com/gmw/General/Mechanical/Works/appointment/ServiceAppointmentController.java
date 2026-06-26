package com.gmw.General.Mechanical.Works.appointment;

import java.security.Principal;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appointments/me")
public class ServiceAppointmentController {

	private final ServiceAppointmentService serviceAppointmentService;

	public ServiceAppointmentController(ServiceAppointmentService serviceAppointmentService) {
		this.serviceAppointmentService = serviceAppointmentService;
	}

	@PostMapping("/workshop")
	public ServiceAppointmentDto createWorkshop(
			Principal principal,
			@Valid @RequestBody CreateWorkshopAppointmentRequest request) {
		return serviceAppointmentService.createWorkshopVisit(principal.getName(), request);
	}
}
