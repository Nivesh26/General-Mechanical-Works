package com.gmw.General.Mechanical.Works.ai;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class OllamaChatMessage {

	private final String role;
	private final String content;
	private final List<String> images;

	private OllamaChatMessage(String role, String content, List<String> images) {
		this.role = role;
		this.content = content;
		this.images = images == null ? List.of() : List.copyOf(images);
	}

	static OllamaChatMessage of(String role, String content) {
		return new OllamaChatMessage(role, content, List.of());
	}

	static OllamaChatMessage withImages(String role, String content, List<String> base64Images) {
		return new OllamaChatMessage(role, content, base64Images);
	}

	boolean hasImages() {
		return !images.isEmpty();
	}

	Map<String, Object> toMap() {
		Map<String, Object> map = new LinkedHashMap<>();
		map.put("role", role);
		map.put("content", content);
		if (hasImages()) {
			map.put("images", images);
		}
		return map;
	}
}
