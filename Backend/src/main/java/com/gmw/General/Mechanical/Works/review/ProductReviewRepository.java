package com.gmw.General.Mechanical.Works.review;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductReviewRepository extends JpaRepository<ProductReview, Long> {

	@Query("""
			SELECT r FROM ProductReview r
			JOIN FETCH r.user
			JOIN FETCH r.product
			WHERE r.product.id = :productId
			ORDER BY r.createdAt DESC
			""")
	List<ProductReview> findByProductIdWithUserOrderByCreatedAtDesc(@Param("productId") Long productId);

	@Query("""
			SELECT r FROM ProductReview r
			JOIN FETCH r.user
			JOIN FETCH r.product
			ORDER BY r.createdAt DESC
			""")
	List<ProductReview> findAllWithUserAndProductOrderByCreatedAtDesc();

	boolean existsByUser_IdAndProduct_Id(Long userId, Long productId);

	@Query("""
			SELECT r FROM ProductReview r
			JOIN FETCH r.user
			JOIN FETCH r.product
			WHERE r.id = :id
			""")
	Optional<ProductReview> findByIdWithDetails(@Param("id") Long id);

	@Query("""
			SELECT CASE WHEN COUNT(o) > 0 THEN true ELSE false END
			FROM ShopOrder o
			JOIN o.lines line
			WHERE o.user.id = :userId
			  AND line.productId = :productId
			  AND o.status = com.gmw.General.Mechanical.Works.order.OrderStatus.DELIVERED
			  AND o.paid = true
			  AND line.cancelled = false
			""")
	boolean userHasDeliveredProduct(@Param("userId") Long userId, @Param("productId") Long productId);
}
