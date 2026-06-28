package com.gmw.General.Mechanical.Works.bill;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;

public final class BillJson {

	private static final JsonParser JSON = JsonParserFactory.getJsonParser();

	private BillJson() {
	}

	@SuppressWarnings("unchecked")
	public static List<BillLineDto> readLines(String raw) {
		if (raw == null || raw.isBlank()) {
			return List.of();
		}
		try {
			Object parsed = JSON.parseMap("{\"lines\":" + raw + "}").get("lines");
			if (!(parsed instanceof List<?> list)) {
				return List.of();
			}
			List<BillLineDto> lines = new ArrayList<>();
			for (Object item : list) {
				if (!(item instanceof Map<?, ?> map)) {
					continue;
				}
				String id = stringValue(map.get("id"));
				String description = stringValue(map.get("description"));
				int quantity = intValue(map.get("quantity"), 1);
				double unitPrice = doubleValue(map.get("unitPrice"), 0);
				if (id == null || id.isBlank()) {
					id = "line-" + lines.size();
				}
				lines.add(new BillLineDto(id, description == null ? "" : description, quantity, unitPrice));
			}
			return lines;
		} catch (Exception ex) {
			return List.of();
		}
	}

	public static String writeLines(List<BillLineDto> lines) {
		if (lines == null || lines.isEmpty()) {
			return "[]";
		}
		StringBuilder sb = new StringBuilder("[");
		for (int i = 0; i < lines.size(); i += 1) {
			BillLineDto line = lines.get(i);
			if (i > 0) {
				sb.append(',');
			}
			sb.append('{')
					.append("\"id\":").append(jsonString(line.id()))
					.append(",\"description\":").append(jsonString(line.description()))
					.append(",\"quantity\":").append(Math.max(0, line.quantity()))
					.append(",\"unitPrice\":").append(Math.max(0, line.unitPrice()))
					.append('}');
		}
		sb.append(']');
		return sb.toString();
	}

	private static String stringValue(Object value) {
		return value == null ? null : String.valueOf(value);
	}

	private static int intValue(Object value, int fallback) {
		if (value instanceof Number number) {
			return number.intValue();
		}
		try {
			return Integer.parseInt(String.valueOf(value));
		} catch (Exception ex) {
			return fallback;
		}
	}

	private static double doubleValue(Object value, double fallback) {
		if (value instanceof Number number) {
			return number.doubleValue();
		}
		try {
			return Double.parseDouble(String.valueOf(value));
		} catch (Exception ex) {
			return fallback;
		}
	}

	private static String jsonString(String value) {
		if (value == null) {
			return "\"\"";
		}
		return "\"" + value
				.replace("\\", "\\\\")
				.replace("\"", "\\\"")
				.replace("\n", "\\n")
				.replace("\r", "\\r")
				.replace("\t", "\\t")
				+ "\"";
	}
}
