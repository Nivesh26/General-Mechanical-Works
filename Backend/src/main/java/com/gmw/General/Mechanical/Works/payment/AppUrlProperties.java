package com.gmw.General.Mechanical.Works.payment;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public class AppUrlProperties {

	private String frontendUrl = "http://localhost:5173";
	private String backendPublicUrl = "http://localhost:8080";

	public String getFrontendUrl() {
		return frontendUrl;
	}

	public void setFrontendUrl(String frontendUrl) {
		this.frontendUrl = frontendUrl;
	}

	public String getBackendPublicUrl() {
		return backendPublicUrl;
	}

	public void setBackendPublicUrl(String backendPublicUrl) {
		this.backendPublicUrl = backendPublicUrl;
	}
}
