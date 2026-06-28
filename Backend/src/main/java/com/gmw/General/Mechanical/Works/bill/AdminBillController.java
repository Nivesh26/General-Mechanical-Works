package com.gmw.General.Mechanical.Works.bill;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/bills")
public class AdminBillController {

	private final BillService billService;

	public AdminBillController(BillService billService) {
		this.billService = billService;
	}

	@GetMapping
	public List<BillDto> list() {
		return billService.listAll();
	}

	@GetMapping("/next-number")
	public String nextInvoiceNumber() {
		return billService.nextInvoiceNumber();
	}

	@PostMapping
	public BillDto create(@Valid @RequestBody SaveBillRequest request) {
		return billService.create(request);
	}

	@PutMapping("/{id}")
	public BillDto update(@PathVariable Long id, @Valid @RequestBody SaveBillRequest request) {
		return billService.update(id, request);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		billService.delete(id);
	}
}
