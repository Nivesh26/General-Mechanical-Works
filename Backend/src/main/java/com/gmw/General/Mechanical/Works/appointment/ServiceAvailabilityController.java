package com.gmw.General.Mechanical.Works.appointment;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/service-availability")
public class ServiceAvailabilityController {

	private final ServiceAvailabilityService serviceAvailabilityService;

	public ServiceAvailabilityController(ServiceAvailabilityService serviceAvailabilityService) {
		this.serviceAvailabilityService = serviceAvailabilityService;
	}

	@GetMapping
	public List<ServiceAvailabilityDto> listBookable() {
		return serviceAvailabilityService.listBookableAvailability();
	}
}
