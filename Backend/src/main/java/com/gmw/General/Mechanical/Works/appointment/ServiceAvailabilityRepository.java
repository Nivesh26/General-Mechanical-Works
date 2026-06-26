package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ServiceAvailabilityRepository extends JpaRepository<ServiceAvailability, Long> {

	Optional<ServiceAvailability> findByAvailabilityDate(LocalDate availabilityDate);

	@Query("""
			SELECT a FROM ServiceAvailability a
			WHERE a.availabilityDate >= :fromDate AND a.availabilityDate <= :toDate
			ORDER BY a.availabilityDate ASC
			""")
	List<ServiceAvailability> findByAvailabilityDateBetweenOrderByAvailabilityDateAsc(
			LocalDate fromDate,
			LocalDate toDate);

	void deleteByAvailabilityDate(LocalDate availabilityDate);
}
