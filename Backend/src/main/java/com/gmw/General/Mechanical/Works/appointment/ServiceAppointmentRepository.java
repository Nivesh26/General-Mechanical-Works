package com.gmw.General.Mechanical.Works.appointment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ServiceAppointmentRepository extends JpaRepository<ServiceAppointment, Long> {

	@Query("""
			SELECT a FROM ServiceAppointment a
			JOIN FETCH a.user
			ORDER BY a.createdAt DESC
			""")
	List<ServiceAppointment> findAllWithUserOrderByCreatedAtDesc();

	@Query("""
			SELECT a FROM ServiceAppointment a
			JOIN FETCH a.user
			WHERE a.id = :id
			""")
	Optional<ServiceAppointment> findByIdWithUser(Long id);

	@Query("""
			SELECT a FROM ServiceAppointment a
			JOIN FETCH a.user
			WHERE a.user.id = :userId
			ORDER BY a.createdAt DESC
			""")
	List<ServiceAppointment> findByUserIdWithUserOrderByCreatedAtDesc(Long userId);
}
