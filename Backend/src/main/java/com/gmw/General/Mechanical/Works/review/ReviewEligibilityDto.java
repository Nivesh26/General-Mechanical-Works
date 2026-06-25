package com.gmw.General.Mechanical.Works.review;

public record ReviewEligibilityDto(
		boolean canReview,
		boolean alreadyReviewed,
		boolean hasDeliveredPurchase) {
}
