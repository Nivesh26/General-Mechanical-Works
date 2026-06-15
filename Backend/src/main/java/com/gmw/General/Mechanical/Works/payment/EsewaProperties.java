package com.gmw.General.Mechanical.Works.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.esewa")
public class EsewaProperties {

	private String merchantCode = "EPAYTEST";
	private String secretKey = "8gBm/:&EnhH.1/q";
	private String formUrl = "https://rc.esewa.com.np/api/epay/main/v2/form";
	private String statusUrl = "https://rc.esewa.com.np/api/epay/transaction/status/";

	public String getMerchantCode() {
		return merchantCode;
	}

	public void setMerchantCode(String merchantCode) {
		this.merchantCode = merchantCode;
	}

	public String getSecretKey() {
		return secretKey;
	}

	public void setSecretKey(String secretKey) {
		this.secretKey = secretKey;
	}

	public String getFormUrl() {
		return formUrl;
	}

	public void setFormUrl(String formUrl) {
		this.formUrl = formUrl;
	}

	public String getStatusUrl() {
		return statusUrl;
	}

	public void setStatusUrl(String statusUrl) {
		this.statusUrl = statusUrl;
	}
}
