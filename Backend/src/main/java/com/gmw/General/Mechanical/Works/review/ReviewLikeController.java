package com.gmw.General.Mechanical.Works.review;

import java.security.Principal;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reviews")
public class ReviewLikeController {

	private final ProductReviewService productReviewService;

	public ReviewLikeController(ProductReviewService productReviewService) {
		this.productReviewService = productReviewService;
	}

	@PostMapping("/{id}/like")
	public ProductReviewDto like(@PathVariable Long id, Principal principal) {
		String email = principal != null ? principal.getName() : null;
		return productReviewService.like(id, email);
	}

	@DeleteMapping("/{id}/like")
	public ProductReviewDto unlike(@PathVariable Long id, Principal principal) {
		String email = principal != null ? principal.getName() : null;
		return productReviewService.unlike(id, email);
	}
}
