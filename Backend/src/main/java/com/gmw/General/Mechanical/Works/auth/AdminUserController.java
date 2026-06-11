package com.gmw.General.Mechanical.Works.auth;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gmw.General.Mechanical.Works.order.OrderDto;
import com.gmw.General.Mechanical.Works.order.OrderService;
import com.gmw.General.Mechanical.Works.vehicle.VehicleDto;
import com.gmw.General.Mechanical.Works.vehicle.VehicleService;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

	private final AuthService authService;
	private final VehicleService vehicleService;
	private final OrderService orderService;

	public AdminUserController(
			AuthService authService,
			VehicleService vehicleService,
			OrderService orderService) {
		this.authService = authService;
		this.vehicleService = vehicleService;
		this.orderService = orderService;
	}

	@GetMapping
	public List<UserProfileDto> listUsers() {
		return authService.listAllUsersForAdmin();
	}

	@GetMapping("/{id}")
	public UserProfileDto getUser(@PathVariable Long id) {
		return authService.getUserByIdForAdmin(id);
	}

	@GetMapping("/{id}/vehicles")
	public List<VehicleDto> listUserVehicles(@PathVariable Long id) {
		return vehicleService.listForUserId(id);
	}

	@GetMapping("/{id}/orders")
	public List<OrderDto> listUserOrders(@PathVariable Long id) {
		return orderService.listForUserId(id);
	}
}
