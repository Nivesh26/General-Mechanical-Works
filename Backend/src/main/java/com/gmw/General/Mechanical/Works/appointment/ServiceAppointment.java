package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.gmw.General.Mechanical.Works.user.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "service_appointment")
public class ServiceAppointment {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(name = "vehicle_id", nullable = false)
	private Long vehicleId;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private AppointmentMode mode = AppointmentMode.WORKSHOP;

	@Enumerated(EnumType.STRING)
	@Column(nullable = false, length = 16)
	private AppointmentStatus status = AppointmentStatus.PENDING;

	@Column(name = "service_ids", nullable = false, columnDefinition = "TEXT")
	private String serviceIdsJson = "";

	@Column(name = "service_titles", nullable = false, columnDefinition = "TEXT")
	private String serviceTitles = "";

	@Column(name = "appointment_date", nullable = false)
	private LocalDate appointmentDate;

	@Column(name = "time_slot", nullable = false, length = 32)
	private String timeSlot;

	@Column(name = "bike_label", nullable = false, length = 255)
	private String bikeLabel;

	@Column(columnDefinition = "TEXT")
	private String notes;

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@PrePersist
	void onCreate() {
		if (createdAt == null) {
			createdAt = LocalDateTime.now();
		}
	}

	public Long getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public Long getVehicleId() {
		return vehicleId;
	}

	public void setVehicleId(Long vehicleId) {
		this.vehicleId = vehicleId;
	}

	public AppointmentMode getMode() {
		return mode;
	}

	public void setMode(AppointmentMode mode) {
		this.mode = mode;
	}

	public AppointmentStatus getStatus() {
		return status;
	}

	public void setStatus(AppointmentStatus status) {
		this.status = status;
	}

	public String getServiceIdsJson() {
		return serviceIdsJson;
	}

	public void setServiceIdsJson(String serviceIdsJson) {
		this.serviceIdsJson = serviceIdsJson;
	}

	public String getServiceTitles() {
		return serviceTitles;
	}

	public void setServiceTitles(String serviceTitles) {
		this.serviceTitles = serviceTitles;
	}

	public LocalDate getAppointmentDate() {
		return appointmentDate;
	}

	public void setAppointmentDate(LocalDate appointmentDate) {
		this.appointmentDate = appointmentDate;
	}

	public String getTimeSlot() {
		return timeSlot;
	}

	public void setTimeSlot(String timeSlot) {
		this.timeSlot = timeSlot;
	}

	public String getBikeLabel() {
		return bikeLabel;
	}

	public void setBikeLabel(String bikeLabel) {
		this.bikeLabel = bikeLabel;
	}

	public String getNotes() {
		return notes;
	}

	public void setNotes(String notes) {
		this.notes = notes;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}
}
