package com.gmw.General.Mechanical.Works.cart;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {

	List<Cart> findAllByUser_IdOrderByUpdatedAtDesc(Long userId);

	Optional<Cart> findByIdAndUser_Id(Long id, Long userId);

	Optional<Cart> findByUser_IdAndProduct_IdAndSizeLabel(Long userId, Long productId, String sizeLabel);

	void deleteAllByUser_Id(Long userId);

	long countByUser_Id(Long userId);
}
