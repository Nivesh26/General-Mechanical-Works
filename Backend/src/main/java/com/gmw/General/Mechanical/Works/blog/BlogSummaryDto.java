package com.gmw.General.Mechanical.Works.blog;

public record BlogSummaryDto(
		Long id,
		String title,
		String dateLabel,
		String description,
		String imagePath,
		int likeCount) {
}
