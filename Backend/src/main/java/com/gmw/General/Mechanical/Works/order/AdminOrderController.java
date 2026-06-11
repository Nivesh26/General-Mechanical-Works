package com.gmw.General.Mechanical.Works.order;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

	private final OrderService orderService;

	public AdminOrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@GetMapping
	public List<OrderDto> list() {
		return orderService.listAllForAdmin();
	}

	@PatchMapping("/{id}/status")
	public OrderDto updateStatus(@PathVariable Long id, @Valid @RequestBody UpdateOrderStatusRequest request) {
		return orderService.updateStatusForAdmin(id, request);
	}
}
