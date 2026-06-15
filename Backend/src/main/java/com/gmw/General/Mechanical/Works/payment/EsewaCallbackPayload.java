package com.gmw.General.Mechanical.Works.payment;

import java.util.LinkedHashMap;
import java.util.Map;

public final class EsewaCallbackPayload {

	private final Map<String, String> fields;

	private EsewaCallbackPayload(Map<String, String> fields) {
		this.fields = fields;
	}

	public static EsewaCallbackPayload fromMap(Map<String, Object> raw) {
		Map<String, String> fields = new LinkedHashMap<>();
		for (Map.Entry<String, Object> entry : raw.entrySet()) {
			if (entry.getValue() != null) {
				fields.put(entry.getKey(), String.valueOf(entry.getValue()));
			}
		}
		return new EsewaCallbackPayload(fields);
	}

	public String get(String key) {
		return fields.getOrDefault(key, "");
	}

	public String status() {
		return get("status");
	}

	public String transactionUuid() {
		return get("transaction_uuid");
	}

	public String signedFieldNames() {
		return get("signed_field_names");
	}

	public String signature() {
		return get("signature");
	}
}
