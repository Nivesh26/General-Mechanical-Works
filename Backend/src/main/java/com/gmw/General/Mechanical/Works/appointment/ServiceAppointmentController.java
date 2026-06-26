package com.gmw.General.Mechanical.Works.appointment;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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

	@GetMapping
	public List<ServiceAppointmentDto> listMine(Principal principal) {
		return serviceAppointmentService.listForUser(principal.getName());
	}

	@PostMapping("/{id}/cancel")
	public ServiceAppointmentDto cancelMine(@PathVariable Long id, Principal principal) {
		return serviceAppointmentService.cancelForUser(principal.getName(), id);
	}

	@PostMapping("/workshop")
	public ServiceAppointmentDto createWorkshop(
			Principal principal,
			@Valid @RequestBody CreateWorkshopAppointmentRequest request) {
		return serviceAppointmentService.createWorkshopVisit(principal.getName(), request);
	}
}
