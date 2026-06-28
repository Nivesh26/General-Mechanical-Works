package com.gmw.General.Mechanical.Works.bill;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

@Service
public class BillService {

	private static final DateTimeFormatter DATE_FORMAT =
			DateTimeFormatter.ofPattern("yyyy-MM-dd", Locale.ROOT);

	private final BillRepository billRepository;

	public BillService(BillRepository billRepository) {
		this.billRepository = billRepository;
	}

	@Transactional(readOnly = true)
	public List<BillDto> listAll() {
		return billRepository.findAllByOrderByUpdatedAtDesc().stream()
				.map(BillMapper::toDto)
				.toList();
	}

	@Transactional
	public BillDto create(SaveBillRequest request) {
		String invoiceNumber = normalizeInvoiceNumber(request.invoiceNumber());
		if (billRepository.existsByInvoiceNumberIgnoreCase(invoiceNumber)) {
			invoiceNumber = nextInvoiceNumber();
		}
		Bill bill = new Bill();
		applyRequest(bill, request, invoiceNumber);
		return BillMapper.toDto(billRepository.save(bill));
	}

	@Transactional
	public BillDto update(Long id, SaveBillRequest request) {
		Bill bill = billRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found"));
		String invoiceNumber = normalizeInvoiceNumber(request.invoiceNumber());
		if (billRepository.existsByInvoiceNumberIgnoreCaseAndIdNot(invoiceNumber, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice number already exists");
		}
		applyRequest(bill, request, invoiceNumber);
		return BillMapper.toDto(billRepository.save(bill));
	}

	@Transactional
	public void delete(Long id) {
		if (!billRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Bill not found");
		}
		billRepository.deleteById(id);
	}

	@Transactional(readOnly = true)
	public String nextInvoiceNumber() {
		int year = LocalDate.now().getYear();
		String prefix = "INV-" + year + "-";
		int max = billRepository.findAllByOrderByUpdatedAtDesc().stream()
				.map(Bill::getInvoiceNumber)
				.mapToInt(number -> {
					if (!number.regionMatches(true, 0, prefix, 0, prefix.length())) {
						return 0;
					}
					try {
						return Integer.parseInt(number.substring(prefix.length()));
					} catch (NumberFormatException ex) {
						return 0;
					}
				})
				.max()
				.orElse(0);
		return prefix + String.format(Locale.ROOT, "%04d", max + 1);
	}

	private static void applyRequest(Bill bill, SaveBillRequest request, String invoiceNumber) {
		List<BillLineDto> lines = normalizeLines(request.lines());
		if (lines.isEmpty()) {
			lines = List.of(new BillLineDto("line-1", "", 1, 0));
		}
		bill.setInvoiceNumber(invoiceNumber);
		bill.setIssuedAt(request.issuedAt());
		bill.setDueAt(request.dueAt());
		bill.setCustomerName(StringUtils.hasText(request.customerName()) ? request.customerName().trim() : "Customer");
		bill.setCustomerEmail(trimToNull(request.customerEmail()));
		bill.setCustomerPhone(trimToNull(request.customerPhone()));
		bill.setCustomerAddress(trimToNull(request.customerAddress()));
		bill.setDiscountPercent(clampDiscount(request.discountPercent()));
		bill.setPaymentTerms(request.paymentTerms().trim());
		bill.setLinesJson(BillJson.writeLines(lines));
	}

	private static List<BillLineDto> normalizeLines(List<BillLineDto> lines) {
		return lines.stream()
				.map(line -> new BillLineDto(
						StringUtils.hasText(line.id()) ? line.id().trim() : "line-" + line.hashCode(),
						line.description() == null ? "" : line.description().trim(),
						Math.max(0, line.quantity()),
						Math.max(0, line.unitPrice())))
				.filter(line -> StringUtils.hasText(line.description())
						|| line.quantity() > 0
						|| line.unitPrice() > 0)
				.toList();
	}

	private static BigDecimal clampDiscount(double value) {
		if (!Double.isFinite(value) || value < 0) {
			return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
		}
		double clamped = Math.min(100, value);
		return BigDecimal.valueOf(clamped).setScale(2, RoundingMode.HALF_UP);
	}

	private static String normalizeInvoiceNumber(String invoiceNumber) {
		if (!StringUtils.hasText(invoiceNumber)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invoice number is required");
		}
		return invoiceNumber.trim();
	}

	private static String trimToNull(String value) {
		if (!StringUtils.hasText(value)) {
			return null;
		}
		return value.trim();
	}

	static final class BillMapper {

		private BillMapper() {
		}

		static BillDto toDto(Bill bill) {
			return new BillDto(
					bill.getId(),
					bill.getInvoiceNumber(),
					bill.getIssuedAt().format(DATE_FORMAT),
					bill.getDueAt().format(DATE_FORMAT),
					bill.getCustomerName(),
					bill.getCustomerEmail(),
					bill.getCustomerPhone(),
					bill.getCustomerAddress(),
					BillJson.readLines(bill.getLinesJson()),
					bill.getDiscountPercent().doubleValue(),
					bill.getPaymentTerms());
		}
	}
}
