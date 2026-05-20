package com.gmw.General.Mechanical.Works.vehicle;

import java.util.List;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class VehicleService {

	private final VehicleRepository vehicleRepository;
	private final UserRepository userRepository;

	public VehicleService(VehicleRepository vehicleRepository, UserRepository userRepository) {
		this.vehicleRepository = vehicleRepository;
		this.userRepository = userRepository;
	}

	@Transactional(readOnly = true)
	public List<VehicleDto> listForUser(String email) {
		User user = requireUser(email);
		return listForUserId(user.getId());
	}

	@Transactional(readOnly = true)
	public List<VehicleDto> listForUserId(Long userId) {
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		if (user.getRole() != Role.USER) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
		}
		return vehicleRepository.findAllByUser_IdOrderByIdAsc(user.getId()).stream()
				.map(VehicleMapper::toDto)
				.toList();
	}

	@Transactional
	public VehicleDto create(String email, VehicleRequest request) {
		User user = requireUser(email);
		String plate = request.plate().trim();
		if (vehicleRepository.existsByUser_IdAndPlateIgnoreCase(user.getId(), plate)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "A vehicle with this license plate already exists");
		}
		Vehicle vehicle = new Vehicle();
		vehicle.setUser(user);
		VehicleMapper.applyRequest(vehicle, request);
		boolean firstVehicle = vehicleRepository.countByUser_Id(user.getId()) == 0;
		vehicle.setMainBike(firstVehicle);
		try {
			return VehicleMapper.toDto(vehicleRepository.save(vehicle));
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "A vehicle with this license plate already exists");
		}
	}

	@Transactional
	public VehicleDto update(String email, Long vehicleId, VehicleRequest request) {
		User user = requireUser(email);
		Vehicle vehicle = vehicleRepository.findByIdAndUser_Id(vehicleId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
		String plate = request.plate().trim();
		if (vehicleRepository.existsByUser_IdAndPlateIgnoreCaseAndIdNot(user.getId(), plate, vehicleId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "A vehicle with this license plate already exists");
		}
		VehicleMapper.applyRequest(vehicle, request);
		try {
			return VehicleMapper.toDto(vehicleRepository.save(vehicle));
		} catch (DataIntegrityViolationException ex) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "A vehicle with this license plate already exists");
		}
	}

	@Transactional
	public void delete(String email, Long vehicleId) {
		User user = requireUser(email);
		Vehicle vehicle = vehicleRepository.findByIdAndUser_Id(vehicleId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
		boolean wasMain = vehicle.isMainBike();
		vehicleRepository.delete(vehicle);
		if (wasMain) {
			List<Vehicle> remaining = vehicleRepository.findAllByUser_IdOrderByIdAsc(user.getId());
			if (!remaining.isEmpty()) {
				Vehicle first = remaining.get(0);
				first.setMainBike(true);
				vehicleRepository.save(first);
			}
		}
	}

	@Transactional
	public List<VehicleDto> setMainBike(String email, Long vehicleId) {
		User user = requireUser(email);
		Vehicle vehicle = vehicleRepository.findByIdAndUser_Id(vehicleId, user.getId())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Vehicle not found"));
		vehicleRepository.clearMainBikeForUser(user.getId());
		vehicle.setMainBike(true);
		vehicleRepository.save(vehicle);
		return listForUser(email);
	}

	private User requireUser(String email) {
		return userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
	}
}
