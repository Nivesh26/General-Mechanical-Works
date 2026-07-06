package com.gmw.General.Mechanical.Works.ai;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ollama")
public class OllamaProperties {

	private boolean enabled = true;
	private String baseUrl = "http://localhost:11434";
	private String chatModel = "llama3.2";
	private String visionModel = "llava";
	private String imageModel = "x/flux2-klein:4b-fp8";
	private boolean imageGenerationEnabled = true;
	private int timeoutSeconds = 120;
	private int imageTimeoutSeconds = 180;

	public boolean isEnabled() {
		return enabled;
	}

	public void setEnabled(boolean enabled) {
		this.enabled = enabled;
	}

	public String getBaseUrl() {
		return baseUrl;
	}

	public void setBaseUrl(String baseUrl) {
		this.baseUrl = baseUrl;
	}

	public String getChatModel() {
		return chatModel;
	}

	public void setChatModel(String chatModel) {
		this.chatModel = chatModel;
	}

	public String getVisionModel() {
		return visionModel;
	}

	public void setVisionModel(String visionModel) {
		this.visionModel = visionModel;
	}

	public String getImageModel() {
		return imageModel;
	}

	public void setImageModel(String imageModel) {
		this.imageModel = imageModel;
	}

	public boolean isImageGenerationEnabled() {
		return imageGenerationEnabled;
	}

	public void setImageGenerationEnabled(boolean imageGenerationEnabled) {
		this.imageGenerationEnabled = imageGenerationEnabled;
	}

	public int getTimeoutSeconds() {
		return timeoutSeconds;
	}

	public void setTimeoutSeconds(int timeoutSeconds) {
		this.timeoutSeconds = timeoutSeconds;
	}

	public int getImageTimeoutSeconds() {
		return imageTimeoutSeconds;
	}

	public void setImageTimeoutSeconds(int imageTimeoutSeconds) {
		this.imageTimeoutSeconds = imageTimeoutSeconds;
	}
}
