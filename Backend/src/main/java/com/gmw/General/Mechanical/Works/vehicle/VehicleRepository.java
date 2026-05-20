package com.gmw.General.Mechanical.Works.vehicle;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

	List<Vehicle> findAllByUser_IdOrderByIdAsc(Long userId);

	Optional<Vehicle> findByIdAndUser_Id(Long id, Long userId);

	boolean existsByUser_IdAndPlateIgnoreCase(Long userId, String plate);

	boolean existsByUser_IdAndPlateIgnoreCaseAndIdNot(Long userId, String plate, Long id);

	long countByUser_Id(Long userId);

	@Modifying
	@Query("UPDATE Vehicle v SET v.mainBike = false WHERE v.user.id = :userId")
	void clearMainBikeForUser(@Param("userId") Long userId);
}
