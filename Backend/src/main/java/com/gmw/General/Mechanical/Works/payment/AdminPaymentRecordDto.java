package com.gmw.General.Mechanical.Works.payment;

import java.math.BigDecimal;

public record AdminPaymentRecordDto(
		String id,
		String reference,
		String source,
		String customerName,
		String customerEmail,
		String date,
		BigDecimal amount,
		String method,
		String status) {
}
