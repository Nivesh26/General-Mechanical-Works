package com.gmw.General.Mechanical.Works.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.mail")
public class EmailProperties {

	private String from = "generalmechanicalworks46@gmail.com";

	public String getFrom() {
		return from;
	}

	public void setFrom(String from) {
		this.from = from;
	}
}
