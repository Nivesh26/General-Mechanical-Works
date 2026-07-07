package com.gmw.General.Mechanical.Works.order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderLineRepository extends JpaRepository<OrderLine, Long> {

	@Query("""
			SELECT DISTINCT ol.imagePath FROM OrderLine ol
			WHERE ol.productId = :productId
			  AND ol.imagePath IS NOT NULL
			  AND ol.imagePath <> ''
			""")
	List<String> findDistinctImagePathsByProductId(@Param("productId") Long productId);
}
