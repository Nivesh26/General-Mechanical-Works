package com.gmw.General.Mechanical.Works.order;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

	@Query("SELECT o FROM ShopOrder o LEFT JOIN FETCH o.lines ORDER BY o.placedAt DESC")
	List<ShopOrder> findAllWithLinesOrderByPlacedAtDesc();

	@Query("""
			SELECT o FROM ShopOrder o
			LEFT JOIN FETCH o.lines
			WHERE LOWER(o.user.email) = LOWER(:email)
			ORDER BY o.placedAt DESC
			""")
	List<ShopOrder> findByUserEmailWithLinesOrderByPlacedAtDesc(@Param("email") String email);

	@Query("""
			SELECT o FROM ShopOrder o
			LEFT JOIN FETCH o.lines
			WHERE o.user.id = :userId
			ORDER BY o.placedAt DESC
			""")
	List<ShopOrder> findByUserIdWithLinesOrderByPlacedAtDesc(@Param("userId") Long userId);

	@Query("""
			SELECT o FROM ShopOrder o
			LEFT JOIN FETCH o.lines
			WHERE o.id = :orderId AND o.user.id = :userId
			""")
	Optional<ShopOrder> findByIdAndUser_IdWithLines(
			@Param("orderId") Long orderId,
			@Param("userId") Long userId);
}
