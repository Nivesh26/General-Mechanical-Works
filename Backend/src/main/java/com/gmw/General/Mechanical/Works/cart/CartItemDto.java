package com.gmw.General.Mechanical.Works.cart;

import java.math.BigDecimal;
import java.util.List;

public record CartItemDto(
		Long id,
		Long productId,
		String productName,
		String sku,
		BigDecimal price,
		int quantity,
		int stock,
		int maxQuantity,
		boolean active,
		String size,
		List<String> imagePaths) {
}
