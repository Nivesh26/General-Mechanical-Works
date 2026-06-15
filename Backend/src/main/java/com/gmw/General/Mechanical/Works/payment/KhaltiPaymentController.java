package com.gmw.General.Mechanical.Works.payment;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.Principal;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
@RequestMapping("/api/payments/khalti")
public class KhaltiPaymentController {

	private final OrderService orderService;
	private final AppUrlProperties appUrlProperties;

	public KhaltiPaymentController(OrderService orderService, AppUrlProperties appUrlProperties) {
		this.orderService = orderService;
		this.appUrlProperties = appUrlProperties;
	}

	@PostMapping("/init")
	public KhaltiInitResponse initPayment(Principal principal, @Valid @RequestBody PlaceOrderRequest request) {
		return orderService.initKhaltiPayment(principal.getName(), request);
	}

	@GetMapping("/return")
	public ResponseEntity<Void> handleReturn(
			@RequestParam(name = "pidx", required = false) String pidx,
			@RequestParam(name = "status", required = false) String status,
			@RequestParam(name = "purchase_order_id", required = false) String purchaseOrderId) {
		String frontendBase = trimTrailingSlash(appUrlProperties.getFrontendUrl());

		if (pidx == null || pidx.isBlank()) {
			return redirect(frontendBase + "/payment/khalti/result?status=error&message="
					+ encode("Missing Khalti payment reference"));
		}

		if ("Completed".equalsIgnoreCase(status)) {
			try {
				OrderDto order = orderService.completeKhaltiPayment(pidx, purchaseOrderId);
				return redirect(frontendBase + "/payment/khalti/result?status=success&orderNumber="
						+ encode(order.orderNumber()));
			} catch (Exception ex) {
				String message = ex.getMessage() != null ? ex.getMessage() : "Payment verification failed";
				return redirect(frontendBase + "/payment/khalti/result?status=error&message=" + encode(message));
			}
		}

		String orderNumber = orderService.failKhaltiPayment(pidx);
		String redirectUrl = frontendBase + "/payment/khalti/result?status=failure";
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
