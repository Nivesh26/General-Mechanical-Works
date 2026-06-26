package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.product.ProductJson;

@Service
public class ServiceAvailabilityService {

	public static final int BOOKING_WINDOW_DAYS = 5;

	private static final DateTimeFormatter DATE_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT);

	private final ServiceAvailabilityRepository serviceAvailabilityRepository;
	private final ServiceAppointmentRepository serviceAppointmentRepository;

	public ServiceAvailabilityService(
			ServiceAvailabilityRepository serviceAvailabilityRepository,
			ServiceAppointmentRepository serviceAppointmentRepository) {
		this.serviceAvailabilityRepository = serviceAvailabilityRepository;
		this.serviceAppointmentRepository = serviceAppointmentRepository;
	}

	@Transactional(readOnly = true)
	public List<ServiceAvailabilityDto> listBookableAvailability() {
		LocalDate today = LocalDate.now();
		LocalDate end = bookingWindowEnd(today);
		return serviceAvailabilityRepository.findByAvailabilityDateBetweenOrderByAvailabilityDateAsc(today, end)
				.stream()
				.map(this::toBookableDto)
				.filter(dto -> !dto.slots().isEmpty())
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ServiceAvailabilityDto> listConfiguredAvailabilityForAdmin() {
		LocalDate today = LocalDate.now();
		LocalDate end = bookingWindowEnd(today);
		return serviceAvailabilityRepository.findByAvailabilityDateBetweenOrderByAvailabilityDateAsc(today, end)
				.stream()
				.map(this::toConfiguredDto)
				.toList();
	}

	@Transactional
	public ServiceAvailabilityDto upsertForAdmin(UpsertServiceAvailabilityRequest request) {
		LocalDate date = request.date();
		validateDateInWindow(date);

		List<String> slots = normalizeSlots(request.slots());
		if (slots.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Select at least one time slot");
		}

		ServiceAvailability row = serviceAvailabilityRepository.findByAvailabilityDate(date)
				.orElseGet(ServiceAvailability::new);
		row.setAvailabilityDate(date);
		row.setTimeSlotsJson(ProductJson.writeStringList(slots));
		ServiceAvailability saved = serviceAvailabilityRepository.save(row);
		return toConfiguredDto(saved);
	}

	@Transactional
	public void deleteForAdmin(LocalDate date) {
		validateDateInWindow(date);
		serviceAvailabilityRepository.deleteByAvailabilityDate(date);
	}

	@Transactional(readOnly = true)
	public void validateBookableSlot(LocalDate date, String timeSlot) {
		validateDateInWindow(date);
		String slot = timeSlot != null ? timeSlot.trim() : "";
		if (!WorkshopServiceCatalog.isValidTimeSlot(slot)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time slot");
		}

		ServiceAvailability configured = serviceAvailabilityRepository.findByAvailabilityDate(date)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"No availability configured for this date"));
		List<String> configuredSlots = ProductJson.readStringList(configured.getTimeSlotsJson());
		if (!configuredSlots.contains(slot)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This time slot is not available");
		}

		Set<String> booked = bookedSlotsFor(date);
		if (booked.contains(slot)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This time slot is already booked");
		}
	}

	static LocalDate bookingWindowEnd(LocalDate today) {
		return today.plusDays(BOOKING_WINDOW_DAYS - 1L);
	}

	private ServiceAvailabilityDto toBookableDto(ServiceAvailability row) {
		List<String> openSlots = new ArrayList<>();
		Set<String> booked = bookedSlotsFor(row.getAvailabilityDate());
		for (String slot : ProductJson.readStringList(row.getTimeSlotsJson())) {
			if (!booked.contains(slot)) {
				openSlots.add(slot);
			}
		}
		return new ServiceAvailabilityDto(row.getAvailabilityDate().format(DATE_FORMAT), openSlots);
	}

	private ServiceAvailabilityDto toConfiguredDto(ServiceAvailability row) {
		return new ServiceAvailabilityDto(
				row.getAvailabilityDate().format(DATE_FORMAT),
				ProductJson.readStringList(row.getTimeSlotsJson()));
	}

	private Set<String> bookedSlotsFor(LocalDate date) {
		return new LinkedHashSet<>(serviceAppointmentRepository.findBookedTimeSlotsForDate(
				date,
				List.of(AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED)));
	}

	private static List<String> normalizeSlots(List<String> slots) {
		LinkedHashSet<String> normalized = new LinkedHashSet<>();
		for (String slot : slots) {
			if (!StringUtils.hasText(slot)) {
				continue;
			}
			String trimmed = slot.trim();
			if (WorkshopServiceCatalog.isValidTimeSlot(trimmed)) {
				normalized.add(trimmed);
			}
		}
		return List.copyOf(normalized);
	}

	private static void validateDateInWindow(LocalDate date) {
		LocalDate today = LocalDate.now();
		if (date.isBefore(today) || date.isAfter(bookingWindowEnd(today))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Choose a date within the next " + BOOKING_WINDOW_DAYS + " days");
		}
	}
}
