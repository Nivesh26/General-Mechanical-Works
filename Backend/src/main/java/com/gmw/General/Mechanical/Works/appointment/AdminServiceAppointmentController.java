package com.gmw.General.Mechanical.Works.appointment;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/appointments")
public class AdminServiceAppointmentController {

	private final ServiceAppointmentService serviceAppointmentService;

	public AdminServiceAppointmentController(ServiceAppointmentService serviceAppointmentService) {
		this.serviceAppointmentService = serviceAppointmentService;
	}

	@GetMapping
	public List<ServiceAppointmentDto> list() {
		return serviceAppointmentService.listAllForAdmin();
	}

	@PatchMapping("/{id}/status")
	public ServiceAppointmentDto updateStatus(
			@PathVariable Long id,
			@Valid @RequestBody UpdateAppointmentStatusRequest request) {
		return serviceAppointmentService.updateStatusForAdmin(id, request);
	}
}
