package com.gmw.General.Mechanical.Works.vehicle;

public record VehicleDto(
		Long id,
		String company,
		String model,
		String plate,
		String color,
		PlateFormat plateFormat,
		boolean isMainBike,
		EmbossedParts embossed,
		TraditionalParts traditional) {

	public record EmbossedParts(String province, String category, String lot, String digits) {
	}

	public record TraditionalParts(String zone, String lot, String category, String digits) {
	}
}
