package com.gmw.General.Mechanical.Works.admin;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmw.General.Mechanical.Works.appointment.AppointmentStatus;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointmentRepository;
import com.gmw.General.Mechanical.Works.order.OrderStatus;
import com.gmw.General.Mechanical.Works.order.ShopOrderRepository;
import com.gmw.General.Mechanical.Works.review.ProductReviewRepository;

@Service
public class AdminNavBadgeService {

	private final ShopOrderRepository shopOrderRepository;
	private final ServiceAppointmentRepository serviceAppointmentRepository;
	private final ProductReviewRepository productReviewRepository;

	public AdminNavBadgeService(
			ShopOrderRepository shopOrderRepository,
			ServiceAppointmentRepository serviceAppointmentRepository,
			ProductReviewRepository productReviewRepository) {
		this.shopOrderRepository = shopOrderRepository;
		this.serviceAppointmentRepository = serviceAppointmentRepository;
		this.productReviewRepository = productReviewRepository;
	}

	@Transactional(readOnly = true)
	public AdminNavBadgesDto buildBadges() {
		long pendingOrders = shopOrderRepository.countByStatus(OrderStatus.PENDING);
		long pendingAppointments = serviceAppointmentRepository.countByStatus(AppointmentStatus.PENDING);
		long newReviews = productReviewRepository.countAwaitingAdminReply();

		return new AdminNavBadgesDto(
				safeInt(pendingOrders),
				safeInt(pendingAppointments),
				safeInt(newReviews));
	}

	private static int safeInt(long value) {
		if (value > Integer.MAX_VALUE) {
			return Integer.MAX_VALUE;
		}
		return (int) value;
	}
}
