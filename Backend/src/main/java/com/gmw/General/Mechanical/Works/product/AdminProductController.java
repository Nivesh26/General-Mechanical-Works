package com.gmw.General.Mechanical.Works.product;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/products")
public class AdminProductController {

	private final ProductService productService;

	public AdminProductController(ProductService productService) {
		this.productService = productService;
	}

	@GetMapping
	public List<ProductDto> list() {
		return productService.listAllForAdmin();
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ProductDto create(
			@RequestParam String sku,
			@RequestParam String name,
			@RequestParam String description,
			@RequestParam(required = false, defaultValue = "") String bulletPoints,
			@RequestParam String category,
			@RequestParam(required = false, defaultValue = "") String sizes,
			@RequestParam BigDecimal price,
			@RequestParam int stock,
			@RequestPart(value = "files", required = false) List<MultipartFile> files) {
		return productService.create(sku, name, description, bulletPoints, category, sizes, price, stock, files);
	}

	@PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ProductDto update(
			@PathVariable Long id,
			@RequestParam String sku,
			@RequestParam String name,
			@RequestParam String description,
			@RequestParam(required = false, defaultValue = "") String bulletPoints,
			@RequestParam String category,
			@RequestParam(required = false, defaultValue = "") String sizes,
			@RequestParam BigDecimal price,
			@RequestParam int stock,
			@RequestParam(required = false) List<String> keepImagePaths,
			@RequestPart(value = "files", required = false) List<MultipartFile> files) {
		return productService.update(
				id, sku, name, description, bulletPoints, category, sizes, price, stock, keepImagePaths, files);
	}

	@PatchMapping("/{id}/active")
	public ProductDto setActive(@PathVariable Long id, @RequestParam boolean active) {
		return productService.setActive(id, active);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		productService.delete(id);
	}
}
