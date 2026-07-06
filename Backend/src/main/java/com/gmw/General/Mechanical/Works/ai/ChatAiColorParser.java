package com.gmw.General.Mechanical.Works.ai;

import java.util.List;
import java.util.Locale;
import java.util.Optional;

import org.springframework.util.StringUtils;

final class ChatAiColorParser {

	private static final List<String> COLORS = List.of(
			"matte black", "gloss black", "metallic silver", "dark blue", "light blue",
			"red", "blue", "black", "white", "green", "yellow", "orange", "silver",
			"grey", "gray", "pink", "purple", "brown", "gold", "maroon", "navy", "beige", "bronze");

	private ChatAiColorParser() {
	}

	static Optional<String> extractTargetColor(String text) {
		if (!StringUtils.hasText(text)) {
			return Optional.empty();
		}
		String normalized = ChatAiIntent.normalizeForIntent(text);
		for (String color : COLORS) {
			if (normalized.contains("to " + color)
					|| normalized.contains("into " + color)
					|| normalized.contains("in " + color)
					|| normalized.contains("paint it " + color)
					|| normalized.contains("make it " + color)
					|| normalized.contains("make this " + color)
					|| normalized.contains("want " + color)
					|| normalized.contains("want it " + color)
					|| normalized.contains("color of " + color)
					|| normalized.contains("colour of " + color)
					|| normalized.contains("color to " + color)
					|| normalized.contains("colour to " + color)
					|| normalized.contains(color + " color")
					|| normalized.contains(color + " paint")
					|| normalized.contains(color + " colour")) {
				return Optional.of(titleCase(color));
			}
		}
		return Optional.empty();
	}

	private static String titleCase(String color) {
		String[] words = color.split(" ");
		StringBuilder builder = new StringBuilder();
		for (int i = 0; i < words.length; i++) {
			if (i > 0) {
				builder.append(' ');
			}
			String word = words[i];
			builder.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
		}
		return builder.toString();
	}
}
