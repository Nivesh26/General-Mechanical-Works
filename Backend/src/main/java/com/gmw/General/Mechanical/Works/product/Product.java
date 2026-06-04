package com.gmw.General.Mechanical.Works.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "product")
public class Product {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false, unique = true, length = 64)
	private String sku;

	@Column(nullable = false, length = 255)
	private String name;

	/** VARCHAR — avoids TINYTEXT (255) from @Lob and broken `TEXT` quoting in DDL. */
	@Column(nullable = false, length = 5000)
	private String description;

	@Column(name = "bullet_points", nullable = false, length = 8000)
	private String bulletPointsJson = "[]";

	@Column(nullable = false, length = 128)
	private String category;

	@Column(name = "sizes_json", nullable = false, length = 500)
	private String sizesJson = "[]";

	@Column(nullable = false, precision = 12, scale = 2)
	private BigDecimal price;

	@Column(nullable = false)
	private int stock;

	@Column(name = "image_paths", nullable = false, length = 12000)
	private String imagePathsJson = "[]";

	@Column(nullable = false)
	private boolean active = true;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt = LocalDateTime.now();

	public Long getId() {
		return id;
	}

	public String getSku() {
		return sku;
	}

	public void setSku(String sku) {
		this.sku = sku;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getBulletPointsJson() {
		return bulletPointsJson;
	}

	public void setBulletPointsJson(String bulletPointsJson) {
		this.bulletPointsJson = bulletPointsJson;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getSizesJson() {
		return sizesJson;
	}

	public void setSizesJson(String sizesJson) {
		this.sizesJson = sizesJson;
	}

	public BigDecimal getPrice() {
		return price;
	}

	public void setPrice(BigDecimal price) {
		this.price = price;
	}

	public int getStock() {
		return stock;
	}

	public void setStock(int stock) {
		this.stock = stock;
	}

	public String getImagePathsJson() {
		return imagePathsJson;
	}

	public void setImagePathsJson(String imagePathsJson) {
		this.imagePathsJson = imagePathsJson;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public List<String> getSizesList() {
		return ProductJson.readStringList(sizesJson);
	}

	public List<String> getImagePathsList() {
		return ProductJson.readStringList(imagePathsJson);
	}
}
