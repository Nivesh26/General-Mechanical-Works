package com.gmw.General.Mechanical.Works.order;

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
@RequestMapping("/api/orders/me")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@GetMapping
	public List<OrderDto> myOrders(Principal principal) {
		return orderService.listForUser(principal.getName());
	}

	@PostMapping
	public OrderDto placeOrder(Principal principal, @Valid @RequestBody PlaceOrderRequest request) {
		return orderService.placeOrder(principal.getName(), request);
	}

	@PostMapping("/{orderId}/lines/{lineId}/cancel")
	public OrderDto cancelOrderLine(
			Principal principal,
			@PathVariable Long orderId,
			@PathVariable Long lineId) {
		return orderService.cancelOrderLineForUser(principal.getName(), orderId, lineId);
	}
}
