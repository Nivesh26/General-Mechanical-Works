package com.gmw.General.Mechanical.Works.order;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ShopOrderRepository extends JpaRepository<ShopOrder, Long> {

	@Query("SELECT o FROM ShopOrder o LEFT JOIN FETCH o.lines ORDER BY o.placedAt DESC")
	List<ShopOrder> findAllWithLinesOrderByPlacedAtDesc();
}
