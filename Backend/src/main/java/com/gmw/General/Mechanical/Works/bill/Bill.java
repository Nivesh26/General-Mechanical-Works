package com.gmw.General.Mechanical.Works.bill;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@Entity
@Table(name = "bill")
public class Bill {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(name = "invoice_number", nullable = false, unique = true, length = 32)
	private String invoiceNumber;

	@Column(name = "issued_at", nullable = false)
	private LocalDate issuedAt;

	@Column(name = "due_at", nullable = false)
	private LocalDate dueAt;

	@Column(name = "customer_name", nullable = false, length = 255)
	private String customerName;

	@Column(name = "customer_email", length = 255)
	private String customerEmail;

	@Column(name = "customer_phone", length = 32)
	private String customerPhone;

	@Column(name = "customer_address", columnDefinition = "TEXT")
	private String customerAddress;

	@Column(name = "discount_percent", nullable = false, precision = 5, scale = 2)
	private BigDecimal discountPercent = BigDecimal.ZERO;

	@Column(name = "payment_terms", nullable = false, length = 64)
	private String paymentTerms;

	@Column(name = "lines_json", nullable = false, columnDefinition = "TEXT")
	private String linesJson = "[]";

	@Column(name = "created_at", nullable = false)
	private LocalDateTime createdAt;

	@Column(name = "updated_at", nullable = false)
	private LocalDateTime updatedAt;

	@PrePersist
	void onCreate() {
		LocalDateTime now = LocalDateTime.now();
		if (createdAt == null) {
			createdAt = now;
		}
		if (updatedAt == null) {
			updatedAt = now;
		}
	}

	@PreUpdate
	void onUpdate() {
		updatedAt = LocalDateTime.now();
	}

	public Long getId() {
		return id;
	}

	public String getInvoiceNumber() {
		return invoiceNumber;
	}

	public void setInvoiceNumber(String invoiceNumber) {
		this.invoiceNumber = invoiceNumber;
	}

	public LocalDate getIssuedAt() {
		return issuedAt;
	}

	public void setIssuedAt(LocalDate issuedAt) {
		this.issuedAt = issuedAt;
	}

	public LocalDate getDueAt() {
		return dueAt;
	}

	public void setDueAt(LocalDate dueAt) {
		this.dueAt = dueAt;
	}

	public String getCustomerName() {
		return customerName;
	}

	public void setCustomerName(String customerName) {
		this.customerName = customerName;
	}

	public String getCustomerEmail() {
		return customerEmail;
	}

	public void setCustomerEmail(String customerEmail) {
		this.customerEmail = customerEmail;
	}

	public String getCustomerPhone() {
		return customerPhone;
	}

	public void setCustomerPhone(String customerPhone) {
		this.customerPhone = customerPhone;
	}

	public String getCustomerAddress() {
		return customerAddress;
	}

	public void setCustomerAddress(String customerAddress) {
		this.customerAddress = customerAddress;
	}

	public BigDecimal getDiscountPercent() {
		return discountPercent;
	}

	public void setDiscountPercent(BigDecimal discountPercent) {
		this.discountPercent = discountPercent;
	}

	public String getPaymentTerms() {
		return paymentTerms;
	}

	public void setPaymentTerms(String paymentTerms) {
		this.paymentTerms = paymentTerms;
	}

	public String getLinesJson() {
		return linesJson;
	}

	public void setLinesJson(String linesJson) {
		this.linesJson = linesJson;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public LocalDateTime getUpdatedAt() {
		return updatedAt;
	}
}
