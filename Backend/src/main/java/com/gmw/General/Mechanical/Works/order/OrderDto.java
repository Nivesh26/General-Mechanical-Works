package com.gmw.General.Mechanical.Works.order;

import java.math.BigDecimal;
import java.util.List;

public record OrderDto(
		Long id,
		String orderNumber,
		String customerName,
		String customerEmail,
		String phone,
		String address,
		String placedAt,
		String confirmedAt,
		String shippedAt,
		String deliveredAt,
		OrderStatus status,
		PaymentMethod paymentMethod,
		BigDecimal subtotal,
		BigDecimal taxAmount,
		BigDecimal total,
		List<OrderLineDto> items) {
}
