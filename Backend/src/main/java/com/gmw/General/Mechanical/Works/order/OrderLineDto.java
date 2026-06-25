package com.gmw.General.Mechanical.Works.order;

import java.math.BigDecimal;

public record OrderLineDto(
		Long id,
		Long productId,
		String productName,
		String sku,
		int quantity,
		BigDecimal unitPrice,
		String sizeLabel,
		String imagePath,
		boolean cancelled,
		String cancelledAt) {
}
