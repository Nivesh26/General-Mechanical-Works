package com.gmw.General.Mechanical.Works.vehicle;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum PlateFormat {
	EMBOSSED("embossed"),
	TRADITIONAL("traditional");

	private final String json;

	PlateFormat(String json) {
		this.json = json;
	}

	@JsonValue
	public String toJson() {
		return json;
	}

	@JsonCreator
	public static PlateFormat fromJson(String value) {
		if (value == null) {
			return EMBOSSED;
		}
		for (PlateFormat format : values()) {
			if (format.json.equalsIgnoreCase(value)) {
				return format;
			}
		}
		throw new IllegalArgumentException("Unknown plate format: " + value);
	}
}
