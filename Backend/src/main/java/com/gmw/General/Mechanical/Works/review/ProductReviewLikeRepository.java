package com.gmw.General.Mechanical.Works.review;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewLikeRepository extends JpaRepository<ProductReviewLike, Long> {

	boolean existsByReviewIdAndUserId(Long reviewId, Long userId);

	void deleteByReviewIdAndUserId(Long reviewId, Long userId);

	@Query("SELECT l.reviewId FROM ProductReviewLike l WHERE l.userId = :userId AND l.reviewId IN :reviewIds")
	List<Long> findReviewIdsByUserIdAndReviewIdIn(
			@Param("userId") Long userId,
			@Param("reviewIds") Collection<Long> reviewIds);
}
