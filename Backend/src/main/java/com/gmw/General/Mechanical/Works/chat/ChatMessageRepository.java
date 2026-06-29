package com.gmw.General.Mechanical.Works.chat;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {

	List<ChatMessage> findByUserIdOrderByCreatedAtAsc(Long userId);

	@Query("""
			SELECT m.userId AS userId, MAX(m.createdAt) AS lastAt
			FROM ChatMessage m
			GROUP BY m.userId
			ORDER BY MAX(m.createdAt) DESC
			""")
	List<ConversationSummaryRow> findConversationSummaries();

	interface ConversationSummaryRow {
		Long getUserId();

		java.time.Instant getLastAt();
	}

	ChatMessage findFirstByUserIdOrderByCreatedAtDesc(Long userId);
}
