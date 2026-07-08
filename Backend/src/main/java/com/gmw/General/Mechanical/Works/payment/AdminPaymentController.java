package com.gmw.General.Mechanical.Works.payment;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/payments")
public class AdminPaymentController {

	private final PaymentHistoryService paymentHistoryService;

	public AdminPaymentController(PaymentHistoryService paymentHistoryService) {
		this.paymentHistoryService = paymentHistoryService;
	}

	@GetMapping
	public List<AdminPaymentRecordDto> list() {
		return paymentHistoryService.listForAdmin();
	}
}
