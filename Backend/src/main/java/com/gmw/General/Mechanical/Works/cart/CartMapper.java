package com.gmw.General.Mechanical.Works.cart;

import com.gmw.General.Mechanical.Works.product.Product;

final class CartMapper {

	static final int MAX_QUANTITY_PER_LINE = 10;

	private CartMapper() {
	}

	static CartItemDto toDto(Cart cart) {
		Product product = cart.getProduct();
		int stock = product.getStock();
		int maxQuantity = Math.min(stock, MAX_QUANTITY_PER_LINE);
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
				size.isEmpty() ? null : size,
				product.getImagePathsList());
	}
}
