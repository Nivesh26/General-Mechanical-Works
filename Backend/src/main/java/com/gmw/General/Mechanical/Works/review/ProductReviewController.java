package com.gmw.General.Mechanical.Works.review;

import java.security.Principal;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ProductReviewController {

	private final ProductReviewService productReviewService;

	public ProductReviewController(ProductReviewService productReviewService) {
		this.productReviewService = productReviewService;
	}

	@GetMapping
	public List<ProductReviewDto> list(@PathVariable Long productId) {
		return productReviewService.listForProduct(productId);
	}

	@GetMapping("/eligibility")
	public ReviewEligibilityDto eligibility(@PathVariable Long productId, Principal principal) {
		return productReviewService.getEligibility(principal.getName(), productId);
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public ProductReviewDto create(
			@PathVariable Long productId,
			Principal principal,
			@RequestParam int rating,
			@RequestParam String comment,
			@RequestPart(value = "images", required = false) List<MultipartFile> images) {
		return productReviewService.create(principal.getName(), productId, rating, comment, images);
	}
}
