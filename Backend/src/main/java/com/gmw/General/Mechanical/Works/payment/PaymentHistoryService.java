package com.gmw.General.Mechanical.Works.payment;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmw.General.Mechanical.Works.order.OrderStatus;
import com.gmw.General.Mechanical.Works.order.PaymentMethod;
import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.order.ShopOrderRepository;

@Service
public class PaymentHistoryService {

	private static final DateTimeFormatter DATE_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT);

	private final ShopOrderRepository shopOrderRepository;

	public PaymentHistoryService(ShopOrderRepository shopOrderRepository) {
		this.shopOrderRepository = shopOrderRepository;
	}

	@Transactional(readOnly = true)
	public List<AdminPaymentRecordDto> listForAdmin() {
		return shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc().stream()
				.filter(PaymentHistoryService::includeOrder)
				.map(PaymentHistoryService::fromOrder)
				.sorted(Comparator.comparing(AdminPaymentRecordDto::date).reversed()
						.thenComparing(AdminPaymentRecordDto::reference).reversed())
				.toList();
	}

	private static boolean includeOrder(ShopOrder order) {
		if (order.getStatus() == OrderStatus.CANCELLED) {
			return false;
		}
		if (order.getPaymentMethod() == PaymentMethod.COD) {
			return true;
		}
		if (order.isPaid()) {
			return true;
		}
		return order.getStatus() == OrderStatus.PENDING;
	}

	private static AdminPaymentRecordDto fromOrder(ShopOrder order) {
		return new AdminPaymentRecordDto(
				"order-" + order.getId(),
				order.getOrderNumber(),
				"ecommerce",
				order.getCustomerName(),
				order.getCustomerEmail(),
				order.getPlacedAt().toLocalDate().format(DATE_FORMAT),
				order.getTotal(),
				displayMethod(order.getPaymentMethod()),
				orderPaymentStatus(order));
	}

	private static String orderPaymentStatus(ShopOrder order) {
		if (order.getPaymentMethod() == PaymentMethod.COD) {
			return order.getStatus() == OrderStatus.DELIVERED ? "paid" : "pending";
		}
		return order.isPaid() ? "paid" : "pending";
	}

	private static String displayMethod(PaymentMethod method) {
		return switch (method) {
			case COD -> "COD";
			case ESEWA -> "eSewa";
			case KHALTI -> "Khalti";
		};
	}
}
