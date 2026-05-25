package com.gmw.General.Mechanical.Works.user;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {

	boolean existsByEmailIgnoreCase(String email);

	Optional<User> findByEmailIgnoreCase(String email);

	Optional<User> findByGoogleSub(String googleSub);

	List<User> findAllByRoleOrderByIdAsc(Role role);
}
