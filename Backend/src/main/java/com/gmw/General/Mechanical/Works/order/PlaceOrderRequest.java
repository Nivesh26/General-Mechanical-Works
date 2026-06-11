package com.gmw.General.Mechanical.Works.order;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public class PlaceOrderRequest {

	@NotEmpty
	private List<Long> cartLineIds;

	@NotBlank
	private String paymentMethod;

	public List<Long> getCartLineIds() {
		return cartLineIds;
	}

	public void setCartLineIds(List<Long> cartLineIds) {
		this.cartLineIds = cartLineIds;
	}

	public String getPaymentMethod() {
		return paymentMethod;
	}

	public void setPaymentMethod(String paymentMethod) {
		this.paymentMethod = paymentMethod;
	}
}
