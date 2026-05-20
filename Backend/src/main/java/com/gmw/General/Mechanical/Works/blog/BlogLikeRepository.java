package com.gmw.General.Mechanical.Works.blog;

import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogLikeRepository extends JpaRepository<BlogLike, Long> {

	boolean existsByBlogIdAndUserId(Long blogId, Long userId);

	void deleteByBlogIdAndUserId(Long blogId, Long userId);
}
