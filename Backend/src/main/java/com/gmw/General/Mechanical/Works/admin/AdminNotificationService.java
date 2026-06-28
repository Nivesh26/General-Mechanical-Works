package com.gmw.General.Mechanical.Works.admin;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmw.General.Mechanical.Works.appointment.AppointmentMode;
import com.gmw.General.Mechanical.Works.appointment.AppointmentStatus;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointment;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointmentRepository;
import com.gmw.General.Mechanical.Works.order.OrderStatus;
import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.order.ShopOrderRepository;

@Service
public class AdminNotificationService {

	private static final int NOTIFICATION_LIMIT = 12;
	private static final DateTimeFormatter CREATED_AT_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.ROOT);

	private final ShopOrderRepository shopOrderRepository;
	private final ServiceAppointmentRepository serviceAppointmentRepository;

	public AdminNotificationService(
			ShopOrderRepository shopOrderRepository,
			ServiceAppointmentRepository serviceAppointmentRepository) {
		this.shopOrderRepository = shopOrderRepository;
		this.serviceAppointmentRepository = serviceAppointmentRepository;
	}

	@Transactional(readOnly = true)
	public AdminNotificationsDto buildNotifications() {
		List<AdminNotificationsDto.AdminNotificationItemDto> notifications = new ArrayList<>();
		int totalCount = 0;

		for (ShopOrder order : shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc()) {
			if (order.getStatus() != OrderStatus.PENDING) {
				continue;
			}
			totalCount += 1;
			notifications.add(new AdminNotificationsDto.AdminNotificationItemDto(
					"order-" + order.getId(),
					"order",
					"New order",
					order.getOrderNumber() + " from " + order.getCustomerName() + " — " + formatNpr(order.getTotal()),
					"/adminorders",
					formatInstant(order.getPlacedAt())));
		}

		for (ServiceAppointment appointment :
				serviceAppointmentRepository.findAllWithUserOrderByCreatedAtDesc()) {
			if (appointment.getStatus() != AppointmentStatus.PENDING) {
				continue;
			}
			totalCount += 1;
			String modeLabel = appointment.getMode() == AppointmentMode.PICKUP ? "Pickup" : "Workshop";
			notifications.add(new AdminNotificationsDto.AdminNotificationItemDto(
					"appointment-" + appointment.getId(),
					"appointment",
					"New appointment",
					"APT-" + appointment.getId() + " · " + appointment.getUser().getName()
							+ " · " + modeLabel + " · " + appointment.getAppointmentDate()
							+ " " + appointment.getTimeSlot(),
					"/adminappointments",
					formatInstant(appointment.getCreatedAt())));
		}

		List<AdminNotificationsDto.AdminNotificationItemDto> sorted = notifications.stream()
				.sorted(Comparator.comparing(AdminNotificationsDto.AdminNotificationItemDto::createdAt).reversed())
				.limit(NOTIFICATION_LIMIT)
				.toList();

		return new AdminNotificationsDto(totalCount, sorted);
	}

	private static String formatInstant(LocalDateTime dateTime) {
		if (dateTime == null) {
			return "";
		}
		return dateTime.format(CREATED_AT_FORMAT);
	}

	private static String formatNpr(BigDecimal amount) {
		if (amount == null) {
			return "NRP 0";
		}
		long whole = amount.setScale(0, RoundingMode.HALF_UP).longValue();
		return "NRP " + String.format(Locale.ENGLISH, "%,d", whole);
	}
}
