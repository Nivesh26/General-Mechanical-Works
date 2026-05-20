package com.gmw.General.Mechanical.Works.vehicle;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VehicleRequest(
		@NotBlank @Size(max = 64) String company,
		@NotBlank @Size(max = 64) String model,
		@NotBlank @Size(max = 128) String plate,
		@Size(max = 32) String color,
		@NotNull PlateFormat plateFormat,
		VehicleDto.EmbossedParts embossed,
		VehicleDto.TraditionalParts traditional) {
}
