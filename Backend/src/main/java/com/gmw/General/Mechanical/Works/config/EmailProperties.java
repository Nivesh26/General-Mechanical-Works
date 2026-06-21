package com.gmw.General.Mechanical.Works.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public class EmailProperties {

	private String from = "generalmechanicalworks46@gmail.com";
	private String brandName = "General Mechanical Works";
	private String brandAddress = "Pulchowk, Lalitpur";
	private String brandPhone = "+977 9851050445";

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}

	public String getBrandName() {
		return brandName;
	}

	public void setBrandName(String brandName) {
		this.brandName = brandName;
	}

	public String getBrandAddress() {
		return brandAddress;
	}

	public void setBrandAddress(String brandAddress) {
		this.brandAddress = brandAddress;
	}

	public String getBrandPhone() {
		return brandPhone;
	}

	public void setBrandPhone(String brandPhone) {
		this.brandPhone = brandPhone;
	}
}
