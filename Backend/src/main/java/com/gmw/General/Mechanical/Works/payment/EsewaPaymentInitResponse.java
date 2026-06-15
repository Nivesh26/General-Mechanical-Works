package com.gmw.General.Mechanical.Works.payment;

public class EsewaPaymentInitResponse {

	private String formAction;
	private Long orderId;
	private String orderNumber;
	private String amount;
	private String taxAmount;
	private String totalAmount;
	private String transactionUuid;
	private String productCode;
	private String productServiceCharge;
	private String productDeliveryCharge;
	private String successUrl;
	private String failureUrl;
	private String signedFieldNames;
	private String signature;

	public String getFormAction() {
		return formAction;
	}

	public void setFormAction(String formAction) {
		this.formAction = formAction;
	}

	public Long getOrderId() {
		return orderId;
	}

	public void setOrderId(Long orderId) {
		this.orderId = orderId;
	}

	public String getOrderNumber() {
		return orderNumber;
	}

	public void setOrderNumber(String orderNumber) {
		this.orderNumber = orderNumber;
	}

	public String getAmount() {
		return amount;
	}

	public void setAmount(String amount) {
		this.amount = amount;
	}

	public String getTaxAmount() {
		return taxAmount;
	}

	public void setTaxAmount(String taxAmount) {
		this.taxAmount = taxAmount;
	}

	public String getTotalAmount() {
		return totalAmount;
	}

	public void setTotalAmount(String totalAmount) {
		this.totalAmount = totalAmount;
	}

	public String getTransactionUuid() {
		return transactionUuid;
	}

	public void setTransactionUuid(String transactionUuid) {
		this.transactionUuid = transactionUuid;
	}

	public String getProductCode() {
		return productCode;
	}

	public void setProductCode(String productCode) {
		this.productCode = productCode;
	}

	public String getProductServiceCharge() {
		return productServiceCharge;
	}

	public void setProductServiceCharge(String productServiceCharge) {
		this.productServiceCharge = productServiceCharge;
	}

	public String getProductDeliveryCharge() {
		return productDeliveryCharge;
	}

	public void setProductDeliveryCharge(String productDeliveryCharge) {
		this.productDeliveryCharge = productDeliveryCharge;
	}

	public String getSuccessUrl() {
		return successUrl;
	}

	public void setSuccessUrl(String successUrl) {
		this.successUrl = successUrl;
	}

	public String getFailureUrl() {
		return failureUrl;
	}

	public void setFailureUrl(String failureUrl) {
		this.failureUrl = failureUrl;
	}

	public String getSignedFieldNames() {
		return signedFieldNames;
	}

	public void setSignedFieldNames(String signedFieldNames) {
		this.signedFieldNames = signedFieldNames;
	}

	public String getSignature() {
		return signature;
	}

	public void setSignature(String signature) {
		this.signature = signature;
	}
}
