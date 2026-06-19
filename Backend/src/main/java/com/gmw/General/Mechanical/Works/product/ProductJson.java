package com.gmw.General.Mechanical.Works.product;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

public final class ProductJson {

	/** Unlikely in SKU, paths, or size labels — used instead of JSON (no Jackson on classpath). */
	private static final String DELIM = "\u001E";

	private ProductJson() {
	}

	public static List<String> readStringList(String raw) {
		if (raw == null || raw.isBlank()) {
			return List.of();
		}
		if (raw.startsWith("[")) {
			return parseLegacyJsonArray(raw);
		}
		return Arrays.stream(raw.split(DELIM, -1))
				.map(String::trim)
				.filter(s -> !s.isEmpty())
				.toList();
	}

	public static String writeStringList(List<String> values) {
		if (values == null || values.isEmpty()) {
			return "";
		}
		return values.stream()
				.map(v -> v == null ? "" : v.replace(DELIM, "").trim())
				.filter(v -> !v.isEmpty())
				.collect(Collectors.joining(DELIM));
	}

	/** Supports rows written before delimiter encoding (e.g. `["a","b"]`). */
	private static List<String> parseLegacyJsonArray(String json) {
		String inner = json.trim();
		if (inner.length() < 2 || inner.charAt(0) != '[' || inner.charAt(inner.length() - 1) != ']') {
			return List.of();
		}
		inner = inner.substring(1, inner.length() - 1).trim();
		if (inner.isEmpty()) {
			return List.of();
		}
		return Arrays.stream(inner.split(","))
				.map(String::trim)
				.map(s -> {
					if (s.length() >= 2 && s.startsWith("\"") && s.endsWith("\"")) {
						return s.substring(1, s.length() - 1);
					}
					return s;
				})
				.filter(s -> !s.isEmpty())
				.toList();
	}
}
