package com.gmw.General.Mechanical.Works.vehicle;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

	private final VehicleService vehicleService;

	public VehicleController(VehicleService vehicleService) {
		this.vehicleService = vehicleService;
	}

	@GetMapping("/me")
	public List<VehicleDto> listMine(Principal principal) {
		return vehicleService.listForUser(principal.getName());
	}

	@PostMapping("/me")
	public VehicleDto create(Principal principal, @Valid @RequestBody VehicleRequest request) {
		return vehicleService.create(principal.getName(), request);
	}

	@PutMapping("/me/{id}")
	public VehicleDto update(Principal principal, @PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
		return vehicleService.update(principal.getName(), id, request);
	}

	@DeleteMapping("/me/{id}")
	public void delete(Principal principal, @PathVariable Long id) {
		vehicleService.delete(principal.getName(), id);
	}

	@PatchMapping("/me/{id}/main")
	public List<VehicleDto> setMain(Principal principal, @PathVariable Long id) {
		return vehicleService.setMainBike(principal.getName(), id);
	}
}
