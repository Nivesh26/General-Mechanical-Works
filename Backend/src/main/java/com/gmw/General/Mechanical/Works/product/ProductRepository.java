package com.gmw.General.Mechanical.Works.product;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

	List<Product> findAllByOrderByCreatedAtDesc();

	List<Product> findAllByActiveTrueOrderByCreatedAtDesc();

	boolean existsBySku(String sku);

	boolean existsBySkuAndIdNot(String sku, Long id);
}
