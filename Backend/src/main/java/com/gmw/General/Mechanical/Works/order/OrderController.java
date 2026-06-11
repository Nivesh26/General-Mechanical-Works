package com.gmw.General.Mechanical.Works.order;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderService orderService;

	public OrderController(OrderService orderService) {
		this.orderService = orderService;
	}

	@GetMapping("/me")
	public List<OrderDto> myOrders(Principal principal) {
		return orderService.listForUser(principal.getName());
	}

	@PostMapping("/me")
	public OrderDto placeOrder(Principal principal, @Valid @RequestBody PlaceOrderRequest request) {
		return orderService.placeOrder(principal.getName(), request);
	}
}
