package com.gmw.General.Mechanical.Works.vehicle;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
		name = "vehicle",
		uniqueConstraints = @UniqueConstraint(name = "uk_vehicle_user_plate", columnNames = { "user_id", "plate" }))
public class Vehicle {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@ManyToOne(fetch = FetchType.LAZY, optional = false)
	@JoinColumn(name = "user_id", nullable = false)
	private User user;

	@Column(nullable = false, length = 64)
	private String company;

	@Column(nullable = false, length = 64)
	private String model;

	@Column(nullable = false, length = 128)
	private String plate;

	@Column(length = 32)
	private String color;

	@Enumerated(EnumType.STRING)
	@Column(name = "plate_format", nullable = false, length = 16)
	private PlateFormat plateFormat = PlateFormat.EMBOSSED;

	@Column(name = "is_main_bike", nullable = false)
	private boolean mainBike;

	@Column(name = "embossed_province", length = 64)
	private String embossedProvince;

	@Column(name = "embossed_category", length = 8)
	private String embossedCategory;

	@Column(name = "embossed_lot", length = 8)
	private String embossedLot;

	@Column(name = "embossed_digits", length = 16)
	private String embossedDigits;

	@Column(name = "traditional_zone", length = 16)
	private String traditionalZone;

	@Column(name = "traditional_lot", length = 16)
	private String traditionalLot;

	@Column(name = "traditional_category", length = 16)
	private String traditionalCategory;

	@Column(name = "traditional_digits", length = 16)
	private String traditionalDigits;

	public Long getId() {
		return id;
	}

	public User getUser() {
		return user;
	}

	public void setUser(User user) {
		this.user = user;
	}

	public String getCompany() {
		return company;
	}

	public void setCompany(String company) {
		this.company = company;
	}

	public String getModel() {
		return model;
	}

	public void setModel(String model) {
		this.model = model;
	}

	public String getPlate() {
		return plate;
	}

	public void setPlate(String plate) {
		this.plate = plate;
	}

	public String getColor() {
		return color;
	}

	public void setColor(String color) {
		this.color = color;
	}

	public PlateFormat getPlateFormat() {
		return plateFormat;
	}

	public void setPlateFormat(PlateFormat plateFormat) {
		this.plateFormat = plateFormat;
	}

	public boolean isMainBike() {
		return mainBike;
	}

	public void setMainBike(boolean mainBike) {
		this.mainBike = mainBike;
	}

	public String getEmbossedProvince() {
		return embossedProvince;
	}

	public void setEmbossedProvince(String embossedProvince) {
		this.embossedProvince = embossedProvince;
	}

	public String getEmbossedCategory() {
		return embossedCategory;
	}

	public void setEmbossedCategory(String embossedCategory) {
		this.embossedCategory = embossedCategory;
	}

	public String getEmbossedLot() {
		return embossedLot;
	}

	public void setEmbossedLot(String embossedLot) {
		this.embossedLot = embossedLot;
	}

	public String getEmbossedDigits() {
		return embossedDigits;
	}

	public void setEmbossedDigits(String embossedDigits) {
		this.embossedDigits = embossedDigits;
	}

	public String getTraditionalZone() {
		return traditionalZone;
	}

	public void setTraditionalZone(String traditionalZone) {
		this.traditionalZone = traditionalZone;
	}

	public String getTraditionalLot() {
		return traditionalLot;
	}

	public void setTraditionalLot(String traditionalLot) {
		this.traditionalLot = traditionalLot;
	}

	public String getTraditionalCategory() {
		return traditionalCategory;
	}

	public void setTraditionalCategory(String traditionalCategory) {
		this.traditionalCategory = traditionalCategory;
	}

	public String getTraditionalDigits() {
		return traditionalDigits;
	}

	public void setTraditionalDigits(String traditionalDigits) {
		this.traditionalDigits = traditionalDigits;
	}
}
