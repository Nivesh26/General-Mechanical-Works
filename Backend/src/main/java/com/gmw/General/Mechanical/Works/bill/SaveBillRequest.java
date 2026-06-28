package com.gmw.General.Mechanical.Works.bill;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SaveBillRequest(
		@NotBlank @Size(max = 32) String invoiceNumber,
		@NotNull LocalDate issuedAt,
		@NotNull LocalDate dueAt,
		@Size(max = 255) String customerName,
		@Size(max = 255) String customerEmail,
		@Size(max = 32) String customerPhone,
		String customerAddress,
		@NotEmpty List<@Valid BillLineDto> lines,
		double discountPercent,
		@NotBlank @Size(max = 64) String paymentTerms) {
}
