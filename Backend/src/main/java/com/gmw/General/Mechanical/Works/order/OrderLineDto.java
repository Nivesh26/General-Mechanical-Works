package com.gmw.General.Mechanical.Works.order;

import java.math.BigDecimal;

public record OrderLineDto(
		String productName,
		String sku,
		int quantity,
		BigDecimal unitPrice,
		String imagePath) {
}
