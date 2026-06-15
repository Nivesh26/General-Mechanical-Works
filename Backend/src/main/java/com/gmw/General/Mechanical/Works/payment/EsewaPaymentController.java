package com.gmw.General.Mechanical.Works.payment;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gmw.General.Mechanical.Works.order.OrderDto;
import com.gmw.General.Mechanical.Works.order.OrderService;
import com.gmw.General.Mechanical.Works.order.PlaceOrderRequest;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments/esewa")
public class EsewaPaymentController {

	private final OrderService orderService;
	private final EsewaService esewaService;
	private final AppUrlProperties appUrlProperties;

	public EsewaPaymentController(
			OrderService orderService,
			EsewaService esewaService,
			AppUrlProperties appUrlProperties) {
		this.orderService = orderService;
		this.esewaService = esewaService;
		this.appUrlProperties = appUrlProperties;
	}

	@PostMapping("/init")
	public EsewaInitResponse initPayment(Principal principal, @Valid @RequestBody PlaceOrderRequest request) {
		return orderService.initEsewaPayment(principal.getName(), request);
	}

	@GetMapping(value = "/launch/{orderId}", produces = MediaType.TEXT_HTML_VALUE)
	public ResponseEntity<String> launchPayment(Principal principal, @PathVariable Long orderId) {
		EsewaPaymentInitResponse payment = orderService.buildEsewaLaunchForm(principal.getName(), orderId);
		return ResponseEntity.ok(esewaService.renderAutoSubmitHtml(payment));
	}

	@GetMapping("/success")
	public ResponseEntity<Void> handleSuccess(@RequestParam(name = "data", required = false) String data)
			throws IOException {
		String frontendBase = trimTrailingSlash(appUrlProperties.getFrontendUrl());
		try {
			EsewaCallbackPayload payload = esewaService.decodeCallbackData(data);
			esewaService.verifyCallbackSignature(payload);
			String transactionUuid = payload.transactionUuid();
			OrderDto order = orderService.completeEsewaPayment(transactionUuid, payload);
			String redirectUrl = frontendBase + "/payment/esewa/result?status=success&orderNumber="
					+ encode(order.orderNumber());
			return redirect(redirectUrl);
		} catch (Exception ex) {
			String message = ex.getMessage() != null ? ex.getMessage() : "Payment verification failed";
			String redirectUrl = frontendBase + "/payment/esewa/result?status=error&message=" + encode(message);
			return redirect(redirectUrl);
		}
	}

	@GetMapping("/failure")
	public ResponseEntity<Void> handleFailure(
			@RequestParam(name = "data", required = false) String data) throws IOException {
		String frontendBase = trimTrailingSlash(appUrlProperties.getFrontendUrl());
		String orderNumber = null;
		if (data != null && !data.isBlank()) {
			try {
				EsewaCallbackPayload payload = esewaService.decodeCallbackData(data);
				String transactionUuid = payload.transactionUuid();
				orderNumber = orderService.failEsewaPayment(transactionUuid);
			} catch (Exception ignored) {
				// Best-effort cleanup; still send user to failure page.
			}
		}
		String redirectUrl = frontendBase + "/payment/esewa/result?status=failure";
		if (orderNumber != null) {
			redirectUrl += "&orderNumber=" + encode(orderNumber);
		}
		return redirect(redirectUrl);
	}

	private static ResponseEntity<Void> redirect(String url) {
		HttpHeaders headers = new HttpHeaders();
		headers.add(HttpHeaders.LOCATION, url);
		return new ResponseEntity<>(headers, HttpStatus.FOUND);
	}

	private static String trimTrailingSlash(String url) {
		return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
	}

	private static String encode(String value) {
		return URLEncoder.encode(value, StandardCharsets.UTF_8);
	}
}
