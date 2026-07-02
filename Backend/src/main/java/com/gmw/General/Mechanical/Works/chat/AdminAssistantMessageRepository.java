package com.gmw.General.Mechanical.Works.chat;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminAssistantMessageRepository extends JpaRepository<AdminAssistantMessage, Long> {

	List<AdminAssistantMessage> findByAdminIdOrderByCreatedAtAsc(Long adminId);

	AdminAssistantMessage findFirstByAdminIdOrderByCreatedAtDesc(Long adminId);
}
