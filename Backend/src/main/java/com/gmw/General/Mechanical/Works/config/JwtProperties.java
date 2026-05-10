package com.gmw.General.Mechanical.Works.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "jwt")
public class JwtProperties {

	/**
	 * HS256 signing secret; use at least 32 bytes for production.
	 */
	private String secret = "DevelopmentSecretKeyReplaceWith32PlusChars!!";

	private long expirationMs = 86_400_000L;

	public String getSecret() {
		return secret;
	}

	public void setSecret(String secret) {
		this.secret = secret;
	}

	public long getExpirationMs() {
		return expirationMs;
	}

	public void setExpirationMs(long expirationMs) {
		this.expirationMs = expirationMs;
	}
}
