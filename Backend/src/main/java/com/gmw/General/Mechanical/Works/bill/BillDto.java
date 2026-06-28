package com.gmw.General.Mechanical.Works.bill;

import java.util.List;

public record BillDto(
		Long id,
		String invoiceNumber,
		String issuedAt,
		String dueAt,
		String customerName,
		String customerEmail,
		String customerPhone,
		String customerAddress,
		List<BillLineDto> lines,
		double discountPercent,
		String paymentTerms) {
}
