package com.gmw.General.Mechanical.Works.payment;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.user.User;

@Service
public class KhaltiService {

	private final KhaltiProperties khaltiProperties;
	private final AppUrlProperties appUrlProperties;
	private final RestClient restClient;
	private final JsonParser jsonParser;

	public KhaltiService(KhaltiProperties khaltiProperties, AppUrlProperties appUrlProperties) {
		this.khaltiProperties = khaltiProperties;
		this.appUrlProperties = appUrlProperties;
		this.restClient = RestClient.create();
		this.jsonParser = JsonParserFactory.getJsonParser();
	}

	public KhaltiPaymentSession initiatePayment(ShopOrder order, User user) {
		if (!StringUtils.hasText(khaltiProperties.getSecretKey())) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Khalti is not configured");
		}

		String backendBase = trimTrailingSlash(appUrlProperties.getBackendPublicUrl());
		String frontendBase = trimTrailingSlash(appUrlProperties.getFrontendUrl());
		int amountPaisa = toPaisa(order.getTotal());

		Map<String, Object> customerInfo = new LinkedHashMap<>();
		if (isSandbox()) {
			// Khalti sandbox docs require test wallet numbers (9800000000–9800000005).
			customerInfo.put("name", "Test User");
			customerInfo.put("email", "test@khalti.com");
			customerInfo.put("phone", "9800000001");
		} else {
			customerInfo.put("name", order.getCustomerName());
			customerInfo.put("email", order.getCustomerEmail());
			String phone = normalizeNepalPhone(user.getPhone());
			if (!StringUtils.hasText(phone)) {
				phone = normalizeNepalPhone(order.getPhone());
			}
			if (StringUtils.hasText(phone)) {
				customerInfo.put("phone", phone);
			}
		}

		Map<String, Object> payload = new LinkedHashMap<>();
		payload.put("return_url", backendBase + "/api/payments/khalti/return");
		payload.put("website_url", frontendBase);
		payload.put("amount", amountPaisa);
		payload.put("purchase_order_id", order.getOrderNumber());
		payload.put("purchase_order_name", "Order " + order.getOrderNumber());
		payload.put("customer_info", customerInfo);

		String body;
		try {
			body = restClient.post()
					.uri(trimTrailingSlash(khaltiProperties.getApiBaseUrl()) + "/epayment/initiate/")
					.header(HttpHeaders.AUTHORIZATION, "key " + khaltiProperties.getSecretKey().trim())
					.contentType(MediaType.APPLICATION_JSON)
					.body(payload)
					.retrieve()
					.body(String.class);
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not start Khalti payment");
		}

		if (!StringUtils.hasText(body)) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from Khalti");
		}

		Map<String, Object> response = jsonParser.parseMap(body);
		if (response.containsKey("error_key") || response.containsKey("detail")) {
			String message = String.valueOf(response.getOrDefault("detail", "Khalti payment initiation failed"));
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
		}

		String pidx = String.valueOf(response.get("pidx"));
		String paymentUrl = String.valueOf(response.get("payment_url"));
		if (!StringUtils.hasText(pidx) || !StringUtils.hasText(paymentUrl) || "null".equals(pidx)) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Invalid response from Khalti");
		}

		return new KhaltiPaymentSession(pidx, paymentUrl, amountPaisa);
	}

	public KhaltiLookupResult lookupPayment(String pidx) {
		if (!StringUtils.hasText(khaltiProperties.getSecretKey())) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Khalti is not configured");
		}

		Map<String, Object> payload = Map.of("pidx", pidx);
		String body;
		try {
			body = restClient.post()
					.uri(trimTrailingSlash(khaltiProperties.getApiBaseUrl()) + "/epayment/lookup/")
					.header(HttpHeaders.AUTHORIZATION, "key " + khaltiProperties.getSecretKey().trim())
					.contentType(MediaType.APPLICATION_JSON)
					.body(payload)
					.retrieve()
					.body(String.class);
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not verify payment with Khalti");
		}

		if (!StringUtils.hasText(body)) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty lookup response from Khalti");
		}

		Map<String, Object> response = jsonParser.parseMap(body);
		String status = String.valueOf(response.getOrDefault("status", ""));
		int totalAmount = parseInt(response.get("total_amount"));
		return new KhaltiLookupResult(pidx, status, totalAmount);
	}

	public static int toPaisa(BigDecimal amountNpr) {
		return amountNpr.multiply(BigDecimal.valueOf(100))
				.setScale(0, RoundingMode.HALF_UP)
				.intValueExact();
	}

	private static int parseInt(Object value) {
		if (value instanceof Number number) {
			return number.intValue();
		}
		return Integer.parseInt(String.valueOf(value));
	}

	private boolean isSandbox() {
		String apiBase = khaltiProperties.getApiBaseUrl();
		return apiBase != null && apiBase.contains("dev.khalti.com");
	}

	private static String normalizeNepalPhone(String phone) {
		if (!StringUtils.hasText(phone)) {
			return null;
		}
		String digits = phone.replaceAll("\\D", "");
		if (digits.startsWith("977") && digits.length() >= 13) {
			digits = digits.substring(3);
		}
		return digits.length() == 10 ? digits : phone.trim();
	}

	private static String trimTrailingSlash(String url) {
		if (url == null) {
			return "";
		}
		return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
	}

	public record KhaltiPaymentSession(String pidx, String paymentUrl, int amountPaisa) {
	}

	public record KhaltiLookupResult(String pidx, String status, int totalAmountPaisa) {
	}
}
