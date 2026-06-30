package com.gmw.General.Mechanical.Works.review;

import java.util.Collection;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewLikeRepository extends JpaRepository<ProductReviewLike, Long> {

	boolean existsByReviewIdAndUserId(Long reviewId, Long userId);

	void deleteByReviewIdAndUserId(Long reviewId, Long userId);

	void deleteByReviewId(Long reviewId);

	@Query("SELECT l.reviewId FROM ProductReviewLike l WHERE l.userId = :userId AND l.reviewId IN :reviewIds")
	List<Long> findReviewIdsByUserIdAndReviewIdIn(
			@Param("userId") Long userId,
			@Param("reviewIds") Collection<Long> reviewIds);

	@Query("""
			SELECT DISTINCT l.reviewId FROM ProductReviewLike l
			WHERE l.reviewId IN :reviewIds
			AND l.userId IN (SELECT u.id FROM AppUser u WHERE u.role = com.gmw.General.Mechanical.Works.user.Role.ADMIN)
			""")
	List<Long> findReviewIdsLikedByAdminIn(@Param("reviewIds") Collection<Long> reviewIds);

	@Query("""
			SELECT CASE WHEN COUNT(l) > 0 THEN true ELSE false END
			FROM ProductReviewLike l
			WHERE l.reviewId = :reviewId
			AND l.userId IN (SELECT u.id FROM AppUser u WHERE u.role = com.gmw.General.Mechanical.Works.user.Role.ADMIN)
			""")
	boolean existsAdminLikeByReviewId(@Param("reviewId") Long reviewId);
}
