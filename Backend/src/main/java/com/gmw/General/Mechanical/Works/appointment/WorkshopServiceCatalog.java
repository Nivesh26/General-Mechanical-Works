package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

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

	private static final DateTimeFormatter DISPLAY_12H =
			DateTimeFormatter.ofPattern("h:mm a", Locale.US);

	private static final List<DateTimeFormatter> PARSE_FORMATS = List.of(
			DateTimeFormatter.ofPattern("H:mm", Locale.US),
			DateTimeFormatter.ofPattern("HH:mm", Locale.US),
			DateTimeFormatter.ofPattern("h:mm a", Locale.US),
			DateTimeFormatter.ofPattern("hh:mm a", Locale.US));

	private WorkshopServiceCatalog() {
	}

	/** Accepts any clock time (00:00–23:59), 12h or 24h text. */
	static boolean isValidTimeSlot(String slot) {
		return normalizeTimeSlot(slot) != null;
	}

	/**
	 * Canonical label used in DB / UI, e.g. {@code 9:00 AM}, {@code 2:00 PM}.
	 * Only whole hours are allowed (minutes must be {@code 00}).
	 * Returns {@code null} if the value is not a valid on-the-hour time.
	 */
	static String normalizeTimeSlot(String slot) {
		if (slot == null) {
			return null;
		}
		String trimmed = slot.trim().replaceAll("\\s+", " ");
		if (trimmed.isEmpty()) {
			return null;
		}
		String candidate = trimmed
				.replace("am", "AM")
				.replace("pm", "PM")
				.replace("a.m.", "AM")
				.replace("p.m.", "PM");
		for (DateTimeFormatter formatter : PARSE_FORMATS) {
			try {
				LocalTime time = LocalTime.parse(candidate, formatter);
				if (time.getMinute() != 0 || time.getSecond() != 0 || time.getNano() != 0) {
					return null;
				}
				return time.format(DISPLAY_12H);
			} catch (DateTimeParseException ignored) {
				// try next
			}
		}
		return null;
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
