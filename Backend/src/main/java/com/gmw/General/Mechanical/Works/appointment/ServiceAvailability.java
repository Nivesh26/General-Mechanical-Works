package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "service_availability",
		uniqueConstraints = @UniqueConstraint(name = "uk_service_availability_date", columnNames = "availability_date"))
public class ServiceAvailability {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "availability_date", nullable = false)
	private LocalDate availabilityDate;

	@Column(name = "time_slots_json", nullable = false, columnDefinition = "TEXT")
	private String timeSlotsJson = "[]";

	public Long getId() {
		return id;
	}

	public LocalDate getAvailabilityDate() {
		return availabilityDate;
	}

	public void setAvailabilityDate(LocalDate availabilityDate) {
		this.availabilityDate = availabilityDate;
	}

	public String getTimeSlotsJson() {
		return timeSlotsJson;
	}

	public void setTimeSlotsJson(String timeSlotsJson) {
		this.timeSlotsJson = timeSlotsJson;
	}
}
