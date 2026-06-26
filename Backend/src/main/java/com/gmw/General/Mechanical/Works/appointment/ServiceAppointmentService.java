package com.gmw.General.Mechanical.Works.appointment;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.auth.EmailService;
import com.gmw.General.Mechanical.Works.mail.AppointmentMailMapper;
import com.gmw.General.Mechanical.Works.product.ProductJson;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;
import com.gmw.General.Mechanical.Works.vehicle.Vehicle;
import com.gmw.General.Mechanical.Works.vehicle.VehicleRepository;

@Service
public class ServiceAppointmentService {

	private static final int MAX_BOOKING_DAYS_AHEAD = 7;
	private static final DateTimeFormatter DATE_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT);
	private static final DateTimeFormatter SUBMITTED_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.ROOT);

	private final ServiceAppointmentRepository serviceAppointmentRepository;
	private final UserRepository userRepository;
	private final VehicleRepository vehicleRepository;
	private final EmailService emailService;
	private final AppointmentMailMapper appointmentMailMapper;

	public ServiceAppointmentService(
			ServiceAppointmentRepository serviceAppointmentRepository,
			UserRepository userRepository,
			VehicleRepository vehicleRepository,
			EmailService emailService,
			AppointmentMailMapper appointmentMailMapper) {
		this.serviceAppointmentRepository = serviceAppointmentRepository;
		this.userRepository = userRepository;
		this.vehicleRepository = vehicleRepository;
		this.emailService = emailService;
		this.appointmentMailMapper = appointmentMailMapper;
	}

	@Transactional
	public ServiceAppointmentDto createWorkshopVisit(String email, CreateWorkshopAppointmentRequest request) {
		User user = requireUser(email);
		List<String> serviceIds = request.serviceIds().stream()
				.map(String::trim)
				.filter(StringUtils::hasText)
				.distinct()
				.toList();
		if (serviceIds.isEmpty() || serviceIds.size() > 3) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose between 1 and 3 services");
		}
		List<String> titles = WorkshopServiceCatalog.resolveTitles(serviceIds);
		if (titles.size() != serviceIds.size()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "One or more services are invalid");
		}
		if (!WorkshopServiceCatalog.isValidTimeSlot(request.timeSlot())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid time slot");
		}
		LocalDate appointmentDate = request.date();
		LocalDate today = LocalDate.now();
		if (appointmentDate.isBefore(today) || appointmentDate.isAfter(today.plusDays(MAX_BOOKING_DAYS_AHEAD))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Choose a date within the next " + MAX_BOOKING_DAYS_AHEAD + " days");
		}

		Vehicle vehicle = vehicleRepository.findByIdAndUser_Id(request.vehicleId(), user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Selected bike was not found"));

		ServiceAppointment appointment = new ServiceAppointment();
		appointment.setUser(user);
		appointment.setVehicleId(vehicle.getId());
		appointment.setMode(AppointmentMode.WORKSHOP);
		appointment.setStatus(AppointmentStatus.PENDING);
		appointment.setServiceIdsJson(ProductJson.writeStringList(serviceIds));
		appointment.setServiceTitles(String.join(", ", titles));
		appointment.setAppointmentDate(appointmentDate);
		appointment.setTimeSlot(request.timeSlot().trim());
		appointment.setBikeLabel(formatBikeLabel(vehicle));
		appointment.setNotes(normalizeNotes(request.notes()));

		ServiceAppointment saved = serviceAppointmentRepository.save(appointment);
		notifyAppointmentBooked(saved);
		return ServiceAppointmentMapper.toDto(saved);
	}

	@Transactional(readOnly = true)
	public List<ServiceAppointmentDto> listForUserId(Long userId) {
		userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return serviceAppointmentRepository.findByUserIdWithUserOrderByCreatedAtDesc(userId).stream()
				.map(ServiceAppointmentMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ServiceAppointmentDto> listForUser(String email) {
		User user = requireUser(email);
		return serviceAppointmentRepository.findByUserIdWithUserOrderByCreatedAtDesc(user.getId()).stream()
				.map(ServiceAppointmentMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ServiceAppointmentDto> listAllForAdmin() {
		return serviceAppointmentRepository.findAllWithUserOrderByCreatedAtDesc().stream()
				.map(ServiceAppointmentMapper::toDto)
				.toList();
	}

	@Transactional
	public ServiceAppointmentDto cancelForUser(String email, Long id) {
		User user = requireUser(email);
		ServiceAppointment appointment = serviceAppointmentRepository.findByIdAndUserIdWithUser(id, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
		if (appointment.getStatus() != AppointmentStatus.PENDING) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Only pending appointments can be cancelled");
		}
		appointment.setStatus(AppointmentStatus.CANCELLED);
		ServiceAppointment saved = serviceAppointmentRepository.save(appointment);
		notifyAppointmentStatusUpdate(saved, AppointmentStatus.CANCELLED);
		return ServiceAppointmentMapper.toDto(saved);
	}

	@Transactional
	public ServiceAppointmentDto updateStatusForAdmin(Long id, UpdateAppointmentStatusRequest request) {
		ServiceAppointment appointment = serviceAppointmentRepository.findByIdWithUser(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
		AppointmentStatus current = appointment.getStatus();
		AppointmentStatus next = request.status();
		if (current == AppointmentStatus.DECLINED
				|| current == AppointmentStatus.CANCELLED
				|| current == AppointmentStatus.COMPLETED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This appointment can no longer be updated");
		}
		if (next == AppointmentStatus.PENDING || next == AppointmentStatus.CANCELLED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid status change");
		}
		if (current == AppointmentStatus.ACCEPTED && next == AppointmentStatus.DECLINED) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Accepted appointments cannot be declined");
		}
		appointment.setStatus(next);
		ServiceAppointment saved = serviceAppointmentRepository.save(appointment);
		if (next == AppointmentStatus.ACCEPTED
				|| next == AppointmentStatus.DECLINED
				|| next == AppointmentStatus.COMPLETED) {
			notifyAppointmentStatusUpdate(saved, next);
		}
		return ServiceAppointmentMapper.toDto(saved);
	}

	private void notifyAppointmentBooked(ServiceAppointment appointment) {
		var mailData = appointmentMailMapper.toView(appointment);
		runAfterCommit(() -> emailService.sendAppointmentBooked(mailData));
	}

	private void notifyAppointmentStatusUpdate(ServiceAppointment appointment, AppointmentStatus status) {
		var mailData = appointmentMailMapper.toView(appointment);
		runAfterCommit(() -> emailService.sendAppointmentStatusUpdate(mailData, status));
	}

	private static void runAfterCommit(Runnable action) {
		if (TransactionSynchronizationManager.isSynchronizationActive()) {
			TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
				@Override
				public void afterCommit() {
					action.run();
				}
			});
		} else {
			action.run();
		}
	}

	private User requireUser(String email) {
		return userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
	}

	private static String normalizeNotes(String notes) {
		if (!StringUtils.hasText(notes)) {
			return null;
		}
		return notes.trim();
	}

	static String formatBikeLabel(Vehicle vehicle) {
		String name = (vehicle.getCompany() + " " + vehicle.getModel()).trim();
		if (!StringUtils.hasText(name)) {
			return vehicle.getPlate();
		}
		return name + " — " + vehicle.getPlate();
	}

	static final class ServiceAppointmentMapper {

		private ServiceAppointmentMapper() {
		}

		static ServiceAppointmentDto toDto(ServiceAppointment appointment) {
			User user = appointment.getUser();
			return new ServiceAppointmentDto(
					appointment.getId(),
					"APT-" + appointment.getId(),
					appointment.getCreatedAt().format(SUBMITTED_FORMAT),
					appointment.getStatus().name().toLowerCase(Locale.ROOT),
					appointment.getMode().name().toLowerCase(Locale.ROOT),
					user.getName(),
					user.getEmail(),
					user.getPhone(),
					ProductJson.readStringList(appointment.getServiceIdsJson()),
					appointment.getServiceTitles(),
					appointment.getAppointmentDate().format(DATE_FORMAT),
					appointment.getTimeSlot(),
					appointment.getBikeLabel(),
					appointment.getNotes());
		}
	}
}
