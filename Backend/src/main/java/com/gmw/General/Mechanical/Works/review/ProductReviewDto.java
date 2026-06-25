package com.gmw.General.Mechanical.Works.review;

import java.util.List;

public record ProductReviewDto(
		Long id,
		Long productId,
		String productName,
		String productDetail,
		String productImage,
		String userPhoto,
		String userName,
		int rating,
		String comment,
		List<String> reviewImages,
		String adminReply,
		String createdAt,
		int likeCount,
		boolean likedByCurrentUser) {
}
