package com.gmw.General.Mechanical.Works.cart;

import com.gmw.General.Mechanical.Works.product.Product;

final class CartMapper {

	private CartMapper() {
	}

	static CartItemDto toDto(Cart cart) {
		Product product = cart.getProduct();
		int stock = product.getStock();
		int maxQuantity = stock;
		String size = cart.getSizeLabel();
		return new CartItemDto(
				cart.getId(),
				product.getId(),
				product.getName(),
				product.getSku(),
				product.getPrice(),
				cart.getQuantity(),
				stock,
				maxQuantity,
				product.isActive(),
				size.isEmpty() ? null : size,
				product.getImagePathsList());
	}
}
