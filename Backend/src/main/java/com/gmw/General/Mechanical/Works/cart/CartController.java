package com.gmw.General.Mechanical.Works.cart;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart/me")
public class CartController {

	private final CartService cartService;

	public CartController(CartService cartService) {
		this.cartService = cartService;
	}

	@GetMapping
	public List<CartItemDto> listMine(Principal principal) {
		return cartService.listForUser(principal.getName());
	}

	@PostMapping
	public CartItemDto add(Principal principal, @Valid @RequestBody CartAddRequest request) {
		return cartService.add(principal.getName(), request);
	}

	@PatchMapping("/{id}")
	public CartItemDto updateQuantity(
			Principal principal,
			@PathVariable Long id,
			@Valid @RequestBody CartUpdateQuantityRequest request) {
		return cartService.updateQuantity(principal.getName(), id, request);
	}

	@DeleteMapping("/{id}")
	public void remove(Principal principal, @PathVariable Long id) {
		cartService.remove(principal.getName(), id);
	}

	@DeleteMapping
	public void clear(Principal principal) {
		cartService.clear(principal.getName());
	}
}
