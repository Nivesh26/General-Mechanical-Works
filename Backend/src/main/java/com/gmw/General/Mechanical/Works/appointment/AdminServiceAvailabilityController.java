package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/service-availability")
public class AdminServiceAvailabilityController {

	private final ServiceAvailabilityService serviceAvailabilityService;

	public AdminServiceAvailabilityController(ServiceAvailabilityService serviceAvailabilityService) {
		this.serviceAvailabilityService = serviceAvailabilityService;
	}

	@GetMapping
	public List<ServiceAvailabilityDto> list() {
		return serviceAvailabilityService.listConfiguredAvailabilityForAdmin();
	}

	@PutMapping
	public ServiceAvailabilityDto upsert(@Valid @RequestBody UpsertServiceAvailabilityRequest request) {
		return serviceAvailabilityService.upsertForAdmin(request);
	}

	@DeleteMapping
	public void delete(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
		serviceAvailabilityService.deleteForAdmin(date);
	}
}
