package com.gmw.General.Mechanical.Works.admin;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gmw.General.Mechanical.Works.appointment.AppointmentStatus;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointment;
import com.gmw.General.Mechanical.Works.appointment.ServiceAppointmentRepository;
import com.gmw.General.Mechanical.Works.appointment.ServiceAvailabilityDto;
import com.gmw.General.Mechanical.Works.appointment.ServiceAvailabilityService;
import com.gmw.General.Mechanical.Works.order.OrderStatus;
import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.order.ShopOrderRepository;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class AdminDashboardService {

	private static final int RECENT_ORDER_LIMIT = 4;
	private static final int UPCOMING_BOOKING_LIMIT = 4;
	private static final int CHART_MONTHS = 6;
	private static final DateTimeFormatter DATE_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT);

	private final ShopOrderRepository shopOrderRepository;
	private final ServiceAppointmentRepository serviceAppointmentRepository;
	private final UserRepository userRepository;
	private final ServiceAvailabilityService serviceAvailabilityService;
	private final AdminNotificationService adminNotificationService;

	public AdminDashboardService(
			ShopOrderRepository shopOrderRepository,
			ServiceAppointmentRepository serviceAppointmentRepository,
			UserRepository userRepository,
			ServiceAvailabilityService serviceAvailabilityService,
			AdminNotificationService adminNotificationService) {
		this.shopOrderRepository = shopOrderRepository;
		this.serviceAppointmentRepository = serviceAppointmentRepository;
		this.userRepository = userRepository;
		this.serviceAvailabilityService = serviceAvailabilityService;
		this.adminNotificationService = adminNotificationService;
	}

	@Transactional(readOnly = true)
	public AdminDashboardDto buildDashboard() {
		List<ShopOrder> orders = shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc();
		List<ServiceAppointment> appointments =
				serviceAppointmentRepository.findAllWithUserOrderByCreatedAtDesc();
		List<User> customers = userRepository.findAllByRoleOrderByIdAsc(Role.USER);

		YearMonth currentMonth = YearMonth.now();
		YearMonth previousMonth = currentMonth.minusMonths(1);
		LocalDate today = LocalDate.now();
		LocalDate yesterday = today.minusDays(1);

		long salesThisMonth = sumSalesForMonth(orders, currentMonth);
		long salesLastMonth = sumSalesForMonth(orders, previousMonth);

		long ordersThisMonth = countOrdersForMonth(orders, currentMonth);
		long ordersLastMonth = countOrdersForMonth(orders, previousMonth);

		long activeUsers = customers.size();
		long orderingUsersThisMonth = distinctOrderingUsersForMonth(orders, currentMonth);
		long orderingUsersLastMonth = distinctOrderingUsersForMonth(orders, previousMonth);

		long totalBookings = appointments.size();
		long bookingsThisMonth = countAppointmentsCreatedInMonth(appointments, currentMonth);
		long bookingsLastMonth = countAppointmentsCreatedInMonth(appointments, previousMonth);

		long bookingsToday = countAppointmentsOnDate(appointments, today);
		long bookingsYesterday = countAppointmentsOnDate(appointments, yesterday);

		AdminNotificationsDto notificationFeed = adminNotificationService.buildNotifications();
		int notificationCount = notificationFeed.count();

		List<AdminDashboardDto.DashboardStatDto> stats = List.of(
				new AdminDashboardDto.DashboardStatDto(
						"Total Sales",
						formatNpr(salesThisMonth),
						formatPercentChange(salesThisMonth, salesLastMonth)),
				new AdminDashboardDto.DashboardStatDto(
						"Total Orders",
						formatCount(ordersThisMonth),
						formatPercentChange(ordersThisMonth, ordersLastMonth)),
				new AdminDashboardDto.DashboardStatDto(
						"Active Users",
						formatCount(activeUsers),
						formatOrderingUsersChange(orderingUsersThisMonth, orderingUsersLastMonth)),
				new AdminDashboardDto.DashboardStatDto(
						"Total Bookings",
						formatCount(totalBookings),
						formatPercentChange(bookingsThisMonth, bookingsLastMonth)),
				new AdminDashboardDto.DashboardStatDto(
						"Bookings Today",
						formatCount(bookingsToday),
						formatDayOverDayChange(bookingsToday, bookingsYesterday)));

		List<YearMonth> chartMonths = chartMonths(currentMonth);
		List<String> monthLabels = chartMonths.stream()
				.map(month -> month.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
				.toList();
		List<Long> monthlySales = chartMonths.stream()
				.map(month -> sumSalesForMonth(orders, month))
				.toList();
		List<Long> monthlyUsers = chartMonths.stream()
				.map(month -> distinctOrderingUsersForMonth(orders, month))
				.toList();

		List<AdminDashboardDto.DashboardRecentOrderDto> recentOrders = orders.stream()
				.limit(RECENT_ORDER_LIMIT)
				.map(order -> new AdminDashboardDto.DashboardRecentOrderDto(
						order.getOrderNumber(),
						order.getCustomerName(),
						formatOrderStatus(order.getStatus())))
				.toList();

		List<AdminDashboardDto.DashboardUpcomingBookingDto> upcomingBookings = appointments.stream()
				.filter(appointment -> !appointment.getAppointmentDate().isBefore(today))
				.filter(appointment -> appointment.getStatus() != AppointmentStatus.CANCELLED
						&& appointment.getStatus() != AppointmentStatus.DECLINED)
				.sorted(Comparator
						.comparing(ServiceAppointment::getAppointmentDate)
						.thenComparing(ServiceAppointment::getTimeSlot))
				.limit(UPCOMING_BOOKING_LIMIT)
				.map(appointment -> new AdminDashboardDto.DashboardUpcomingBookingDto(
						"APT-" + appointment.getId(),
						appointment.getUser().getName(),
						formatBookingSlot(appointment.getAppointmentDate(), appointment.getTimeSlot(), today),
						appointment.getServiceTitles(),
						formatAppointmentStatus(appointment.getStatus())))
				.toList();

		List<AdminDashboardDto.DashboardAvailabilityDto> serviceAvailability =
				serviceAvailabilityService.listConfiguredAvailabilityForAdmin().stream()
						.map(this::toAvailabilityDto)
						.toList();

		return new AdminDashboardDto(
				stats,
				monthLabels,
				monthlySales,
				monthlyUsers,
				recentOrders,
				upcomingBookings,
				serviceAvailability,
				notificationFeed.count(),
				notificationFeed.notifications());
	}

	private AdminDashboardDto.DashboardAvailabilityDto toAvailabilityDto(ServiceAvailabilityDto dto) {
		LocalDate date = LocalDate.parse(dto.date(), DATE_FORMAT);
		String day = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);
		return new AdminDashboardDto.DashboardAvailabilityDto(dto.date(), day, dto.slots());
	}

	private static List<YearMonth> chartMonths(YearMonth endMonth) {
		List<YearMonth> months = new ArrayList<>();
		for (int i = CHART_MONTHS - 1; i >= 0; i -= 1) {
			months.add(endMonth.minusMonths(i));
		}
		return months;
	}

	private static long sumSalesForMonth(List<ShopOrder> orders, YearMonth month) {
		return orders.stream()
				.filter(order -> order.getStatus() != OrderStatus.CANCELLED)
				.filter(order -> isInMonth(order.getPlacedAt(), month))
				.map(ShopOrder::getTotal)
				.map(AdminDashboardService::toWholeRupees)
				.reduce(0L, Long::sum);
	}

	private static long countOrdersForMonth(List<ShopOrder> orders, YearMonth month) {
		return orders.stream()
				.filter(order -> order.getStatus() != OrderStatus.CANCELLED)
				.filter(order -> isInMonth(order.getPlacedAt(), month))
				.count();
	}

	private static long distinctOrderingUsersForMonth(List<ShopOrder> orders, YearMonth month) {
		Set<Long> userIds = new HashSet<>();
		for (ShopOrder order : orders) {
			if (order.getStatus() == OrderStatus.CANCELLED) {
				continue;
			}
			if (isInMonth(order.getPlacedAt(), month)) {
				userIds.add(order.getUser().getId());
			}
		}
		return userIds.size();
	}

	private static long countAppointmentsCreatedInMonth(
			List<ServiceAppointment> appointments,
			YearMonth month) {
		return appointments.stream()
				.filter(appointment -> isInMonth(appointment.getCreatedAt(), month))
				.count();
	}

	private static long countAppointmentsOnDate(List<ServiceAppointment> appointments, LocalDate date) {
		return appointments.stream()
				.filter(appointment -> appointment.getAppointmentDate().equals(date))
				.filter(appointment -> appointment.getStatus() != AppointmentStatus.CANCELLED
						&& appointment.getStatus() != AppointmentStatus.DECLINED)
				.count();
	}

	private static boolean isInMonth(LocalDateTime dateTime, YearMonth month) {
		if (dateTime == null) {
			return false;
		}
		YearMonth value = YearMonth.from(dateTime);
		return value.equals(month);
	}

	private static long toWholeRupees(BigDecimal amount) {
		if (amount == null) {
			return 0L;
		}
		return amount.setScale(0, RoundingMode.HALF_UP).longValue();
	}

	private static String formatNpr(long amount) {
		return "NRP " + String.format(Locale.ENGLISH, "%,d", amount);
	}

	private static String formatCount(long count) {
		return String.format(Locale.ENGLISH, "%,d", count);
	}

	private static String formatPercentChange(long current, long previous) {
		if (previous == 0) {
			if (current == 0) {
				return "No change from last month";
			}
			return "+" + current + " new this month";
		}
		double pct = ((current - previous) * 100.0) / previous;
		String sign = pct >= 0 ? "+" : "";
		return String.format(Locale.ENGLISH, "%s%.1f%% from last month", sign, pct);
	}

	private static String formatOrderingUsersChange(long current, long previous) {
		if (previous == 0) {
			if (current == 0) {
				return "No ordering customers this month";
			}
			return current + " ordered this month";
		}
		double pct = ((current - previous) * 100.0) / previous;
		String sign = pct >= 0 ? "+" : "";
		return String.format(Locale.ENGLISH, "%s%.1f%% ordering customers vs last month", sign, pct);
	}

	private static String formatDayOverDayChange(long todayCount, long yesterdayCount) {
		long diff = todayCount - yesterdayCount;
		if (diff == 0) {
			return "Same as yesterday";
		}
		if (diff > 0) {
			return "+" + diff + " vs yesterday";
		}
		return diff + " vs yesterday";
	}

	private static String formatOrderStatus(OrderStatus status) {
		return switch (status) {
			case PENDING -> "Pending";
			case CONFIRMED -> "Confirmed";
			case SHIPPED -> "Shipped";
			case DELIVERED -> "Delivered";
			case CANCELLED -> "Cancelled";
		};
	}

	private static String formatAppointmentStatus(AppointmentStatus status) {
		return switch (status) {
			case PENDING -> "Pending";
			case ACCEPTED -> "Accepted";
			case DECLINED -> "Declined";
			case CANCELLED -> "Cancelled";
			case COMPLETED -> "Completed";
		};
	}

	private static String formatBookingSlot(LocalDate date, String timeSlot, LocalDate today) {
		String dayLabel;
		if (date.equals(today)) {
			dayLabel = "Today";
		} else if (date.equals(today.plusDays(1))) {
			dayLabel = "Tomorrow";
		} else {
			dayLabel = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.ENGLISH)
					+ ", "
					+ date.format(DateTimeFormatter.ofPattern("d MMM", Locale.ENGLISH));
		}
		return dayLabel + ", " + timeSlot;
	}
}
