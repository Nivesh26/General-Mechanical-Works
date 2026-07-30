package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

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

	@Transactional
	public List<ServiceAvailabilityDto> listBookableAvailability() {
		purgeExpiredAvailability();
		LocalDate today = LocalDate.now();
		LocalDate end = bookingWindowEnd(today);
		return serviceAvailabilityRepository.findByAvailabilityDateBetweenOrderByAvailabilityDateAsc(today, end)
				.stream()
				.map(this::toBookableDto)
				.filter(dto -> !dto.slots().isEmpty())
				.toList();
	}

	@Transactional
	public List<ServiceAvailabilityDto> listConfiguredAvailabilityForAdmin() {
		purgeExpiredAvailability();
		LocalDate today = LocalDate.now();
		LocalDate end = bookingWindowEnd(today);
		return serviceAvailabilityRepository.findByAvailabilityDateBetweenOrderByAvailabilityDateAsc(today, end)
				.stream()
				.map(this::toConfiguredDto)
				.toList();
	}

	@Transactional
	public ServiceAvailabilityDto upsertForAdmin(UpsertServiceAvailabilityRequest request) {
		purgeExpiredAvailability();
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

	private static final List<AppointmentStatus> SLOT_BLOCKING_STATUSES =
			List.of(AppointmentStatus.PENDING, AppointmentStatus.ACCEPTED);

	@Transactional
	public void validateBookableSlot(LocalDate date, String timeSlot) {
		validateDateInWindow(date);
		String slot = normalizeSlotLabel(timeSlot);
		if (!WorkshopServiceCatalog.isValidTimeSlot(slot)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time slot");
		}

		ServiceAvailability configured = serviceAvailabilityRepository.findByAvailabilityDate(date)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"No availability configured for this date"));
		List<String> configuredSlots = ProductJson.readStringList(configured.getTimeSlotsJson()).stream()
				.map(ServiceAvailabilityService::normalizeSlotLabel)
				.filter(WorkshopServiceCatalog::isValidTimeSlot)
				.toList();
		if (!configuredSlots.contains(slot)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This time slot is not available");
		}

		if (isSlotBooked(date, slot)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "This time slot is already booked");
		}
	}

	static LocalDate bookingWindowEnd(LocalDate today) {
		return today.plusDays(BOOKING_WINDOW_DAYS - 1L);
	}

	@Transactional
	public void purgeExpiredAvailability() {
		serviceAvailabilityRepository.deleteByAvailabilityDateBefore(LocalDate.now());
	}

	private ServiceAvailabilityDto toBookableDto(ServiceAvailability row) {
		Set<String> booked = bookedSlotsFor(row.getAvailabilityDate());
		// Keep admin-configured labels; only hide times that are already booked.
		List<String> openSlots = ProductJson.readStringList(row.getTimeSlotsJson()).stream()
				.map(ServiceAvailabilityService::normalizeSlotLabel)
				.filter(StringUtils::hasText)
				.filter(slot -> !booked.contains(slot))
				.distinct()
				.toList();
		return new ServiceAvailabilityDto(row.getAvailabilityDate().format(DATE_FORMAT), openSlots);
	}

	private ServiceAvailabilityDto toConfiguredDto(ServiceAvailability row) {
		return new ServiceAvailabilityDto(
				row.getAvailabilityDate().format(DATE_FORMAT),
				ProductJson.readStringList(row.getTimeSlotsJson()));
	}

	private Set<String> bookedSlotsFor(LocalDate date) {
		return serviceAppointmentRepository.findBookedTimeSlotsForDate(date, SLOT_BLOCKING_STATUSES).stream()
				.map(ServiceAvailabilityService::normalizeSlotLabel)
				.filter(StringUtils::hasText)
				.collect(Collectors.toCollection(LinkedHashSet::new));
	}

	boolean isSlotBooked(LocalDate date, String timeSlot) {
		String slot = normalizeSlotLabel(timeSlot);
		if (!StringUtils.hasText(slot)) {
			return false;
		}
		return serviceAppointmentRepository.countActiveBookingsForSlot(date, slot, SLOT_BLOCKING_STATUSES) > 0;
	}

	private static String normalizeSlotLabel(String slot) {
		if (slot == null) {
			return "";
		}
		return slot.trim().replaceAll("\\s+", " ");
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
