package com.gmw.General.Mechanical.Works.product;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductRepository extends JpaRepository<Product, Long> {

	List<Product> findAllByOrderByCreatedAtDesc();

	List<Product> findAllByActiveTrueOrderByCreatedAtDesc();

	Optional<Product> findByIdAndActiveTrue(Long id);

	boolean existsBySku(String sku);

	boolean existsBySkuAndIdNot(String sku, Long id);
}
