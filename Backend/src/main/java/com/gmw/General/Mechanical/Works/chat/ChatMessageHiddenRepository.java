package com.gmw.General.Mechanical.Works.chat;

import java.util.Collection;
import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ChatMessageHiddenRepository extends JpaRepository<ChatMessageHidden, Long> {

	boolean existsByMessageIdAndHiddenByUserId(Long messageId, Long hiddenByUserId);

	@Query("""
			SELECT h.messageId FROM ChatMessageHidden h
			WHERE h.hiddenByUserId = :viewerUserId
			  AND h.messageId IN :messageIds
			""")
	Set<Long> findHiddenMessageIdsForViewer(
			@Param("viewerUserId") Long viewerUserId,
			@Param("messageIds") Collection<Long> messageIds);

	void deleteByMessageId(Long messageId);

	List<ChatMessageHidden> findByHiddenByUserIdAndMessageIdIn(Long hiddenByUserId, Collection<Long> messageIds);
}
