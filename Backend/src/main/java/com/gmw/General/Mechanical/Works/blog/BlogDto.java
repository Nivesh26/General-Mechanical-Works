package com.gmw.General.Mechanical.Works.blog;

public record BlogDto(
		Long id,
		String title,
		String dateLabel,
		String body,
		String imagePath,
		int likeCount,
		boolean likedByCurrentUser) {
}
