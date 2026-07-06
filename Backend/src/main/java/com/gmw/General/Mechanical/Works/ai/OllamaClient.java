package com.gmw.General.Mechanical.Works.ai;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@EnableConfigurationProperties(OllamaProperties.class)
public class OllamaClient {

	private final OllamaProperties properties;
	private final RestClient restClient;

	public OllamaClient(OllamaProperties properties) {
		this.properties = properties;
		SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
		requestFactory.setReadTimeout(Duration.ofSeconds(Math.max(30, properties.getTimeoutSeconds())));
		this.restClient = RestClient.builder()
				.baseUrl(properties.getBaseUrl())
				.requestFactory(requestFactory)
				.build();
	}

	public String chat(List<OllamaChatMessage> messages) {
		if (!properties.isEnabled()) {
			throw new IllegalStateException("Ollama is disabled");
		}
		if (messages == null || messages.isEmpty()) {
			throw new IllegalArgumentException("messages are required");
		}
		boolean useVision = messages.stream().anyMatch(OllamaChatMessage::hasImages);
		String model = useVision ? properties.getVisionModel() : properties.getChatModel();
		List<Map<String, Object>> payload = messages.stream().map(OllamaChatMessage::toMap).toList();
		try {
			OllamaChatResponse response = restClient.post()
					.uri("/api/chat")
					.contentType(MediaType.APPLICATION_JSON)
					.body(Map.of(
							"model", model,
							"messages", payload,
							"stream", false))
					.retrieve()
					.body(OllamaChatResponse.class);
			if (response == null || response.message() == null) {
				throw new RestClientException("Empty Ollama response");
			}
			String content = response.message().content();
			if (!StringUtils.hasText(content)) {
				throw new RestClientException("Ollama returned empty content");
			}
			return content.trim();
		} catch (RestClientException ex) {
			throw new RestClientException("Ollama request failed: " + ex.getMessage(), ex);
		}
	}

	public Duration requestTimeout() {
		return Duration.ofSeconds(Math.max(10, properties.getTimeoutSeconds()));
	}

	private record OllamaChatResponse(OllamaMessage message) {
	}

	private record OllamaMessage(String role, String content) {
	}
}
