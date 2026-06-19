package com.gmw.General.Mechanical.Works.storage;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cloudinary")
public class CloudinaryProperties {

	private String cloudName = "";
	private String apiKey = "";
	private String apiSecret = "";
	private boolean migrateLocalUploads = true;

	public String getCloudName() {
		return cloudName;
	}

	public void setCloudName(String cloudName) {
		this.cloudName = cloudName;
	}

	public String getApiKey() {
		return apiKey;
	}

	public void setApiKey(String apiKey) {
		this.apiKey = apiKey;
	}

	public String getApiSecret() {
		return apiSecret;
	}

	public void setApiSecret(String apiSecret) {
		this.apiSecret = apiSecret;
	}

	public boolean isMigrateLocalUploads() {
		return migrateLocalUploads;
	}

	public void setMigrateLocalUploads(boolean migrateLocalUploads) {
		this.migrateLocalUploads = migrateLocalUploads;
	}

	public boolean isConfigured() {
		return cloudName != null && !cloudName.isBlank()
				&& apiKey != null && !apiKey.isBlank()
				&& apiSecret != null && !apiSecret.isBlank();
	}
}
