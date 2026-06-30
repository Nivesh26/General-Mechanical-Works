package com.gmw.General.Mechanical.Works.admin;

import java.util.List;

public record AdminDashboardDto(
		List<DashboardStatDto> stats,
		List<String> monthLabels,
		List<Long> monthlySales,
		List<Long> monthlyUsers,
		List<DashboardRecentOrderDto> recentOrders,
		List<DashboardUpcomingBookingDto> upcomingBookings,
		List<DashboardInboxChatDto> inboxChats,
		List<DashboardAvailabilityDto> serviceAvailability,
		int notificationCount,
		List<AdminNotificationsDto.AdminNotificationItemDto> notifications) {

	public record DashboardStatDto(String label, String value, String change) {
	}

	public record DashboardRecentOrderDto(String id, String customer, String status) {
	}

	public record DashboardUpcomingBookingDto(String id, String client, String slot, String service, String status) {
	}

	public record DashboardInboxChatDto(
			Long userId,
			String userName,
			String snippet,
			String lastMessageAt,
			Long lastMessageId,
			String lastMessageSender,
			boolean online,
			String profilePicture) {
	}

	public record DashboardAvailabilityDto(String date, String day, List<String> slots) {
	}
}
