package com.gmw.General.Mechanical.Works.review;

import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/reviews")
public class AdminProductReviewController {

	private final ProductReviewService productReviewService;

	public AdminProductReviewController(ProductReviewService productReviewService) {
		this.productReviewService = productReviewService;
	}

	@GetMapping
	public List<ProductReviewDto> list() {
		return productReviewService.listAllForAdmin();
	}

	@PutMapping("/{id}/reply")
	public ProductReviewDto reply(@PathVariable Long id, @RequestBody Map<String, String> body) {
		return productReviewService.setAdminReply(id, body.get("reply"));
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		productReviewService.deleteForAdmin(id);
	}
}
