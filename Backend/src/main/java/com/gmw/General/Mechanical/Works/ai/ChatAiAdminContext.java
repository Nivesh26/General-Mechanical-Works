package com.gmw.General.Mechanical.Works.ai;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.gmw.General.Mechanical.Works.appointment.AppointmentStatus;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointment;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointmentRepository;
import com.gmw.General.Mechanical.Works.order.OrderStatus;
import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.order.ShopOrderRepository;
import com.gmw.General.Mechanical.Works.product.ProductRepository;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Component
public class ChatAiAdminContext {

	private static final int MAX_RECENT_ORDERS = 12;
	private static final int MAX_RECENT_APPOINTMENTS = 12;
	private static final int MAX_TODAY_APPOINTMENTS = 20;
	private static final DateTimeFormatter DATE_FORMAT =
			DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH);

	private final ShopOrderRepository shopOrderRepository;
	private final ServiceAppointmentRepository serviceAppointmentRepository;
	private final UserRepository userRepository;
	private final ProductRepository productRepository;

	public ChatAiAdminContext(
			ShopOrderRepository shopOrderRepository,
			ServiceAppointmentRepository serviceAppointmentRepository,
			UserRepository userRepository,
			ProductRepository productRepository) {
		this.shopOrderRepository = shopOrderRepository;
		this.serviceAppointmentRepository = serviceAppointmentRepository;
		this.userRepository = userRepository;
		this.productRepository = productRepository;
	}

	@Transactional(readOnly = true)
	public String buildLiveShopDataSection() {
		LocalDate today = LocalDate.now();
		List<ShopOrder> orders = shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc();
		List<ServiceAppointment> appointments =
				serviceAppointmentRepository.findAllWithUserOrderByCreatedAtDesc();

		long customerCount = userRepository.findAllByRoleOrderByIdAsc(Role.USER).size();
		long activeProducts = productRepository.findAllByActiveTrueOrderByCreatedAtDesc().size();

		long pendingOrders = orders.stream().filter(order -> order.getStatus() == OrderStatus.PENDING).count();
		long confirmedOrders = orders.stream().filter(order -> order.getStatus() == OrderStatus.CONFIRMED).count();
		long shippedOrders = orders.stream().filter(order -> order.getStatus() == OrderStatus.SHIPPED).count();

		long pendingBookings = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.PENDING)
				.count();
		long acceptedBookings = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.ACCEPTED)
				.count();
		long completedBookings = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.COMPLETED)
				.count();

		List<ServiceAppointment> todayAppointments = appointments.stream()
				.filter(appointment -> appointment.getAppointmentDate().equals(today))
				.filter(appointment -> appointment.getStatus() != AppointmentStatus.CANCELLED
						&& appointment.getStatus() != AppointmentStatus.DECLINED)
				.sorted(Comparator
						.comparing(ServiceAppointment::getTimeSlot)
						.thenComparing(ServiceAppointment::getId))
				.toList();

		StringBuilder section = new StringBuilder();
		section.append("=== LIVE SHOP DATA (admin dashboard — use ONLY these facts) ===\n");
		section.append("- Registered customers: ").append(customerCount).append('\n');
		section.append("- Active products: ").append(activeProducts).append('\n');
		section.append("- Orders — Pending: ")
				.append(pendingOrders)
				.append(", Confirmed: ")
				.append(confirmedOrders)
				.append(", Shipped: ")
				.append(shippedOrders)
				.append('\n');
		section.append("- Service bookings — Pending: ")
				.append(pendingBookings)
				.append(", Accepted: ")
				.append(acceptedBookings)
				.append(", Completed: ")
				.append(completedBookings)
				.append('\n');
		section.append("- Appointments scheduled for today (")
				.append(today.format(DATE_FORMAT))
				.append("): ")
				.append(todayAppointments.size())
				.append('\n');

		appendTodayAppointments(section, todayAppointments);
		appendRecentOrders(section, orders);
		appendRecentAppointments(section, appointments);
		return section.toString();
	}

	@Transactional(readOnly = true)
	public String buildTodayBookingsReply() {
		LocalDate today = LocalDate.now();
		List<ServiceAppointment> appointments =
				serviceAppointmentRepository.findAllWithUserOrderByCreatedAtDesc().stream()
						.filter(appointment -> appointment.getAppointmentDate().equals(today))
						.filter(appointment -> appointment.getStatus() != AppointmentStatus.CANCELLED
								&& appointment.getStatus() != AppointmentStatus.DECLINED)
						.sorted(Comparator
								.comparing(ServiceAppointment::getTimeSlot)
								.thenComparing(ServiceAppointment::getId))
						.toList();

		long pending = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.PENDING)
				.count();
		long accepted = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.ACCEPTED)
				.count();
		long completed = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.COMPLETED)
				.count();

		StringBuilder reply = new StringBuilder();
		reply.append("Today's bookings (")
				.append(today.format(DATE_FORMAT))
				.append("):\n\n");
		reply.append("• Total scheduled: ").append(appointments.size()).append('\n');
		reply.append("• Pending: ").append(pending).append('\n');
		reply.append("• Accepted: ").append(accepted).append('\n');
		reply.append("• Completed: ").append(completed).append('\n');

		if (appointments.isEmpty()) {
			reply.append("\nNo service appointments are scheduled for today.");
			reply.append("\nManage bookings in Admin → Appointments.");
			return reply.toString();
		}

		reply.append("\nSchedule:\n");
		appointments.stream().limit(MAX_TODAY_APPOINTMENTS).forEach(appointment -> reply.append("• ")
				.append(appointment.getTimeSlot())
				.append(" — ")
				.append(appointment.getUser().getName())
				.append(" — ")
				.append(appointment.getServiceTitles())
				.append(" — ")
				.append(formatStatus(appointment.getStatus()))
				.append(" (")
				.append(appointment.getMode().name().toLowerCase(Locale.ROOT))
				.append(")\n"));

		if (appointments.size() > MAX_TODAY_APPOINTMENTS) {
			reply.append("… and ").append(appointments.size() - MAX_TODAY_APPOINTMENTS).append(" more.\n");
		}
		reply.append("\nOpen Admin → Appointments for full details.");
		return reply.toString();
	}

	@Transactional(readOnly = true)
	public String buildOrdersSummaryReply() {
		List<ShopOrder> orders = shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc();
		long pending = orders.stream().filter(order -> order.getStatus() == OrderStatus.PENDING).count();
		long confirmed = orders.stream().filter(order -> order.getStatus() == OrderStatus.CONFIRMED).count();
		long shipped = orders.stream().filter(order -> order.getStatus() == OrderStatus.SHIPPED).count();
		long delivered = orders.stream().filter(order -> order.getStatus() == OrderStatus.DELIVERED).count();

		StringBuilder reply = new StringBuilder();
		reply.append("Shop orders overview:\n\n");
		reply.append("• Pending: ").append(pending).append('\n');
		reply.append("• Confirmed: ").append(confirmed).append('\n');
		reply.append("• Shipped: ").append(shipped).append('\n');
		reply.append("• Delivered: ").append(delivered).append('\n');

		List<ShopOrder> recent = orders.stream().limit(8).toList();
		if (recent.isEmpty()) {
			reply.append("\nNo orders yet.");
			return reply.toString();
		}

		reply.append("\nRecent orders:\n");
		recent.forEach(order -> reply.append("• #")
				.append(order.getOrderNumber())
				.append(" — ")
				.append(order.getCustomerName())
				.append(" — ")
				.append(formatStatus(order.getStatus()))
				.append(" — Rs. ")
				.append(formatAmount(order.getTotal()))
				.append(" — ")
				.append(order.getPaymentMethod())
				.append('\n'));

		reply.append("\nOpen Admin → Orders to update status.");
		return reply.toString();
	}

	@Transactional(readOnly = true)
	public String buildAppointmentsSummaryReply() {
		List<ServiceAppointment> appointments =
				serviceAppointmentRepository.findAllWithUserOrderByCreatedAtDesc();
		long pending = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.PENDING)
				.count();
		long accepted = appointments.stream()
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.ACCEPTED)
				.count();

		StringBuilder reply = new StringBuilder();
		reply.append("Service appointments overview:\n\n");
		reply.append("• Pending approval: ").append(pending).append('\n');
		reply.append("• Accepted (upcoming/in progress): ").append(accepted).append('\n');

		List<ServiceAppointment> upcoming = appointments.stream()
				.filter(appointment -> !appointment.getAppointmentDate().isBefore(LocalDate.now()))
				.filter(appointment -> appointment.getStatus() == AppointmentStatus.PENDING
						|| appointment.getStatus() == AppointmentStatus.ACCEPTED)
				.sorted(Comparator
						.comparing(ServiceAppointment::getAppointmentDate)
						.thenComparing(ServiceAppointment::getTimeSlot))
				.limit(8)
				.toList();

		if (upcoming.isEmpty()) {
			reply.append("\nNo upcoming pending or accepted appointments.");
			return reply.toString();
		}

		reply.append("\nUpcoming:\n");
		upcoming.forEach(appointment -> reply.append("• ")
				.append(formatDateLabel(appointment.getAppointmentDate()))
				.append(", ")
				.append(appointment.getTimeSlot())
				.append(" — ")
				.append(appointment.getUser().getName())
				.append(" — ")
				.append(appointment.getServiceTitles())
				.append(" — ")
				.append(formatStatus(appointment.getStatus()))
				.append('\n'));

		reply.append("\nOpen Admin → Appointments to accept, decline, or complete.");
		return reply.toString();
	}

	private void appendTodayAppointments(StringBuilder section, List<ServiceAppointment> todayAppointments) {
		if (todayAppointments.isEmpty()) {
			section.append("- Today's appointment list: none\n");
			return;
		}
		section.append("- Today's appointment list:\n");
		todayAppointments.stream().limit(MAX_TODAY_APPOINTMENTS).forEach(appointment -> section.append("  • ")
				.append(appointment.getTimeSlot())
				.append(" — ")
				.append(appointment.getUser().getName())
				.append(" — ")
				.append(appointment.getServiceTitles())
				.append(" — ")
				.append(formatStatus(appointment.getStatus()))
				.append('\n'));
	}

	private void appendRecentOrders(StringBuilder section, List<ShopOrder> orders) {
		if (orders.isEmpty()) {
			section.append("- Recent orders: none\n");
			return;
		}
		section.append("- Recent orders:\n");
		orders.stream().limit(MAX_RECENT_ORDERS).forEach(order -> section.append("  • #")
				.append(order.getOrderNumber())
				.append(" — ")
				.append(order.getCustomerName())
				.append(" — ")
				.append(formatStatus(order.getStatus()))
				.append(" — Rs. ")
				.append(formatAmount(order.getTotal()))
				.append('\n'));
	}

	private void appendRecentAppointments(StringBuilder section, List<ServiceAppointment> appointments) {
		if (appointments.isEmpty()) {
			section.append("- Recent service bookings: none\n");
			return;
		}
		section.append("- Recent service bookings:\n");
		appointments.stream().limit(MAX_RECENT_APPOINTMENTS).forEach(appointment -> section.append("  • ")
				.append(formatDateLabel(appointment.getAppointmentDate()))
				.append(' ')
				.append(appointment.getTimeSlot())
				.append(" — ")
				.append(appointment.getUser().getName())
				.append(" — ")
				.append(appointment.getServiceTitles())
				.append(" — ")
				.append(formatStatus(appointment.getStatus()))
				.append('\n'));
	}

	private static String formatDateLabel(LocalDate date) {
		LocalDate today = LocalDate.now();
		if (date.equals(today)) {
			return "Today";
		}
		if (date.equals(today.plusDays(1))) {
			return "Tomorrow";
		}
		return date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
				+ ", "
				+ date.format(DATE_FORMAT);
	}

	private static String formatStatus(OrderStatus status) {
		return switch (status) {
			case PENDING -> "Pending";
			case CONFIRMED -> "Confirmed";
			case SHIPPED -> "Shipped";
			case DELIVERED -> "Delivered";
			case CANCELLED -> "Cancelled";
		};
	}

	private static String formatStatus(AppointmentStatus status) {
		return switch (status) {
			case PENDING -> "Pending";
			case ACCEPTED -> "Accepted";
			case DECLINED -> "Declined";
			case CANCELLED -> "Cancelled";
			case COMPLETED -> "Completed";
		};
	}

	private static String formatAmount(BigDecimal amount) {
		if (amount == null) {
			return "0";
		}
		return amount.stripTrailingZeros().toPlainString();
	}
}
