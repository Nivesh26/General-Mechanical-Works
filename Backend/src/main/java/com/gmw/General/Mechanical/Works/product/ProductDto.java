package com.gmw.General.Mechanical.Works.product;

import java.math.BigDecimal;
import java.util.List;

public record ProductDto(
		Long id,
		String sku,
		String name,
		String description,
		List<String> bulletPoints,
		String category,
		List<String> sizes,
		BigDecimal price,
		int stock,
		List<String> imagePaths,
		boolean active) {
}
