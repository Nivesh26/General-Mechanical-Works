package com.gmw.General.Mechanical.Works.blog;

import org.springframework.util.StringUtils;

final class BlogMapper {

	private static final int SUMMARY_MAX = 280;

	private BlogMapper() {
	}

	static BlogDto toDto(Blog blog) {
		return new BlogDto(
				blog.getId(),
				blog.getTitle(),
				blog.getDateLabel(),
				blog.getBody(),
				blog.getImagePath(),
				blog.getLikeCount());
	}

	static BlogSummaryDto toSummary(Blog blog) {
		return new BlogSummaryDto(
				blog.getId(),
				blog.getTitle(),
				blog.getDateLabel(),
				summarize(blog.getBody()),
				blog.getImagePath(),
				blog.getLikeCount());
	}

	private static String summarize(String body) {
		if (!StringUtils.hasText(body)) {
			return "";
		}
		String normalized = body.trim().replaceAll("\\s+", " ");
		if (normalized.length() <= SUMMARY_MAX) {
			return normalized;
		}
		return normalized.substring(0, SUMMARY_MAX).trim() + "…";
	}
}
