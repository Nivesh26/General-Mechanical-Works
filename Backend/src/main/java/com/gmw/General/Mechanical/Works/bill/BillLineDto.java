package com.gmw.General.Mechanical.Works.bill;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record BillLineDto(
		String id,
		@NotBlank String description,
		@Min(1) int quantity,
		@Positive double unitPrice) {
}
