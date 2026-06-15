package com.gmw.General.Mechanical.Works.payment;

import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.boot.json.JsonParser;
import org.springframework.boot.json.JsonParserFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

@Service
public class EsewaService {

	private static final String SIGNED_FIELD_NAMES = "total_amount,transaction_uuid,product_code";

	private final EsewaProperties esewaProperties;
	private final AppUrlProperties appUrlProperties;
	private final RestClient restClient;
	private final JsonParser jsonParser;

	public EsewaService(EsewaProperties esewaProperties, AppUrlProperties appUrlProperties) {
		this.esewaProperties = esewaProperties;
		this.appUrlProperties = appUrlProperties;
		this.restClient = RestClient.create();
		this.jsonParser = JsonParserFactory.getJsonParser();
	}

	public String newTransactionUuid() {
		return "GMW-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
	}

	public EsewaPaymentInitResponse buildPaymentForm(
			Long orderId,
			String orderNumber,
			BigDecimal subtotal,
			BigDecimal taxAmount,
			BigDecimal total,
			String transactionUuid) {
		String amount = formatAmount(subtotal);
		String tax = formatAmount(taxAmount);
		String totalAmount = formatAmount(total);
		String signature = signInit(totalAmount, transactionUuid);

		String backendBase = trimTrailingSlash(appUrlProperties.getBackendPublicUrl());
		String successUrl = backendBase + "/api/payments/esewa/success";
		String failureUrl = backendBase + "/api/payments/esewa/failure";

		EsewaPaymentInitResponse response = new EsewaPaymentInitResponse();
		response.setFormAction(esewaProperties.getFormUrl());
		response.setOrderId(orderId);
		response.setOrderNumber(orderNumber);
		response.setAmount(amount);
		response.setTaxAmount(tax);
		response.setTotalAmount(totalAmount);
		response.setTransactionUuid(transactionUuid);
		response.setProductCode(esewaProperties.getMerchantCode());
		response.setProductServiceCharge("0");
		response.setProductDeliveryCharge("0");
		response.setSuccessUrl(successUrl);
		response.setFailureUrl(failureUrl);
		response.setSignedFieldNames(SIGNED_FIELD_NAMES);
		response.setSignature(signature);
		return response;
	}

	public EsewaCallbackPayload decodeCallbackData(String encodedData) {
		if (!StringUtils.hasText(encodedData)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Missing eSewa payment data");
		}
		try {
			String decoded = new String(Base64.getDecoder().decode(encodedData.trim()), StandardCharsets.UTF_8);
			Map<String, Object> raw = jsonParser.parseMap(decoded);
			return EsewaCallbackPayload.fromMap(raw);
		} catch (IllegalArgumentException ex) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid eSewa payment data");
		}
	}

	public void verifyCallbackSignature(EsewaCallbackPayload payload) {
		String signedFieldNames = payload.signedFieldNames();
		if (!StringUtils.hasText(signedFieldNames)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid eSewa signature fields");
		}

		String message = buildSignedMessage(payload, signedFieldNames);
		String expected = sign(message);
		String received = payload.signature();
		if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8), received.getBytes(StandardCharsets.UTF_8))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eSewa signature verification failed");
		}
	}

	public void verifyWithEsewaStatusApi(String transactionUuid, BigDecimal totalAmount) {
		String total = formatAmount(totalAmount);
		String url = esewaProperties.getStatusUrl()
				+ "?product_code=" + encode(esewaProperties.getMerchantCode())
				+ "&total_amount=" + encode(total)
				+ "&transaction_uuid=" + encode(transactionUuid);

		String body;
		try {
			body = restClient.get()
					.uri(url)
					.retrieve()
					.body(String.class);
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not verify payment with eSewa");
		}

		if (!StringUtils.hasText(body)) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty response from eSewa");
		}

		Map<String, Object> result = jsonParser.parseMap(body);
		String status = String.valueOf(result.getOrDefault("status", ""));
		String verifiedUuid = String.valueOf(result.getOrDefault("transaction_uuid", ""));
		if (!"COMPLETE".equalsIgnoreCase(status) || !transactionUuid.equals(verifiedUuid)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "eSewa payment was not completed");
		}
	}

	public String signInit(String totalAmount, String transactionUuid) {
		String message = "total_amount=" + totalAmount
				+ ",transaction_uuid=" + transactionUuid
				+ ",product_code=" + esewaProperties.getMerchantCode();
		return sign(message);
	}

	private String sign(String message) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			SecretKeySpec keySpec = new SecretKeySpec(
					esewaProperties.getSecretKey().getBytes(StandardCharsets.UTF_8),
					"HmacSHA256");
			mac.init(keySpec);
			byte[] hash = mac.doFinal(message.getBytes(StandardCharsets.UTF_8));
			return Base64.getEncoder().encodeToString(hash);
		} catch (NoSuchAlgorithmException | InvalidKeyException ex) {
			throw new IllegalStateException("Could not generate eSewa signature", ex);
		}
	}

	private static String buildSignedMessage(EsewaCallbackPayload payload, String signedFieldNames) {
		return java.util.Arrays.stream(signedFieldNames.split(","))
				.map(String::trim)
				.filter(StringUtils::hasText)
				.map(field -> field + "=" + payload.get(field))
				.collect(Collectors.joining(","));
	}

	private static String formatAmount(BigDecimal amount) {
		BigDecimal normalized = amount.stripTrailingZeros();
		if (normalized.scale() <= 0) {
			return normalized.toPlainString();
		}
		return String.format(Locale.US, "%.2f", amount);
	}

	private static String trimTrailingSlash(String url) {
		if (url == null) {
			return "";
		}
		return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
	}

	private static String encode(String value) {
		return java.net.URLEncoder.encode(value, StandardCharsets.UTF_8);
	}

	public String renderAutoSubmitHtml(EsewaPaymentInitResponse payment) {
		if (!StringUtils.hasText(payment.getFormAction()) || !payment.getFormAction().startsWith("https://")) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "eSewa payment URL is not configured");
		}

		return """
				<!DOCTYPE html>
				<html lang="en">
				<head>
				  <meta charset="UTF-8" />
				  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
				  <title>Redirecting to eSewa…</title>
				</head>
				<body>
				  <p>Redirecting to eSewa. Please wait…</p>
				  <form id="esewa-payment-form" method="POST" action="%s">
				    <input type="hidden" name="amount" value="%s" />
				    <input type="hidden" name="tax_amount" value="%s" />
				    <input type="hidden" name="total_amount" value="%s" />
				    <input type="hidden" name="transaction_uuid" value="%s" />
				    <input type="hidden" name="product_code" value="%s" />
				    <input type="hidden" name="product_service_charge" value="%s" />
				    <input type="hidden" name="product_delivery_charge" value="%s" />
				    <input type="hidden" name="success_url" value="%s" />
				    <input type="hidden" name="failure_url" value="%s" />
				    <input type="hidden" name="signed_field_names" value="%s" />
				    <input type="hidden" name="signature" value="%s" />
				  </form>
				  <script>document.getElementById('esewa-payment-form').submit();</script>
				</body>
				</html>
				""".formatted(
				escapeHtml(payment.getFormAction()),
				escapeHtml(payment.getAmount()),
				escapeHtml(payment.getTaxAmount()),
				escapeHtml(payment.getTotalAmount()),
				escapeHtml(payment.getTransactionUuid()),
				escapeHtml(payment.getProductCode()),
				escapeHtml(payment.getProductServiceCharge()),
				escapeHtml(payment.getProductDeliveryCharge()),
				escapeHtml(payment.getSuccessUrl()),
				escapeHtml(payment.getFailureUrl()),
				escapeHtml(payment.getSignedFieldNames()),
				escapeHtml(payment.getSignature()));
	}

	private static String escapeHtml(String value) {
		if (value == null) {
			return "";
		}
		return value
				.replace("&", "&amp;")
				.replace("\"", "&quot;")
				.replace("<", "&lt;")
				.replace(">", "&gt;");
	}
}
