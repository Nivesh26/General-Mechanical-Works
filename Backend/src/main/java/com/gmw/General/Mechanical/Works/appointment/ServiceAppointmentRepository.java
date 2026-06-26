package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
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
			WHERE a.id = :id AND a.user.id = :userId
			""")
	Optional<ServiceAppointment> findByIdAndUserIdWithUser(Long id, Long userId);

	@Query("""
			SELECT a FROM ServiceAppointment a
			JOIN FETCH a.user
			WHERE a.user.id = :userId
			ORDER BY a.createdAt DESC
			""")
	List<ServiceAppointment> findByUserIdWithUserOrderByCreatedAtDesc(Long userId);

	@Query("""
			SELECT a.timeSlot FROM ServiceAppointment a
			WHERE a.appointmentDate = :date
			  AND a.status IN :statuses
			""")
	List<String> findBookedTimeSlotsForDate(
			@org.springframework.data.repository.query.Param("date") LocalDate date,
			@org.springframework.data.repository.query.Param("statuses") List<AppointmentStatus> statuses);

	boolean existsByAppointmentDateAndTimeSlotAndStatusIn(
			LocalDate appointmentDate,
			String timeSlot,
			List<AppointmentStatus> statuses);
}
