package com.gmw.General.Mechanical.Works.appointment;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

final class WorkshopServiceCatalog {

	private static final Map<String, String> SERVICES = new LinkedHashMap<>();

	static {
		SERVICES.put("service", "Service Work");
		SERVICES.put("tyre", "Tyre Repair");
		SERVICES.put("wash", "Bike Wash");
		SERVICES.put("engine", "Engine Repair");
		SERVICES.put("dent", "Dent & painting");
		SERVICES.put("modify", "Modify bike");
		SERVICES.put("battery", "Battery Service");
		SERVICES.put("chain", "Chain & Sprocket");
		SERVICES.put("other", "Other");
	}

	private static final Set<String> TIME_SLOTS = Set.of(
			"9:00 AM",
			"10:00 AM",
			"11:00 AM",
			"2:00 PM",
			"3:00 PM",
			"4:00 PM");

	private WorkshopServiceCatalog() {
	}

	static boolean isValidTimeSlot(String slot) {
		return slot != null && TIME_SLOTS.contains(slot.trim());
	}

	static String titleFor(String serviceId) {
		return SERVICES.get(serviceId);
	}

	static List<String> resolveTitles(List<String> serviceIds) {
		return serviceIds.stream()
				.map(id -> SERVICES.get(id != null ? id.trim() : ""))
				.filter(title -> title != null && !title.isBlank())
				.toList();
	}
}
