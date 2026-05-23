package com.gmw.General.Mechanical.Works.offer;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferRepository extends JpaRepository<Offer, Long> {

	List<Offer> findAllByOrderByCreatedAtDesc();
}
