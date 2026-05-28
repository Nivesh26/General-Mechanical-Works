package com.gmw.General.Mechanical.Works.product;

final class ProductMapper {

	private ProductMapper() {
	}

	static ProductDto toDto(Product product) {
		return new ProductDto(
				product.getId(),
				product.getSku(),
				product.getName(),
				product.getDescription(),
				ProductJson.readStringList(product.getBulletPointsJson()),
				product.getCategory(),
				ProductJson.readStringList(product.getSizesJson()),
				product.getPrice(),
				product.getStock(),
				ProductJson.readStringList(product.getImagePathsJson()),
				product.isActive());
	}
}
