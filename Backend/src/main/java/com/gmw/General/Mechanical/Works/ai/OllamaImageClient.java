package com.gmw.General.Mechanical.Works.ai;

import java.time.Duration;
import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

@Component
@EnableConfigurationProperties(OllamaProperties.class)
class OllamaImageClient {

	private static final Logger log = LoggerFactory.getLogger(OllamaImageClient.class);

	private final OllamaProperties properties;
	private final RestClient restClient;
	private final BikeColorPreviewRenderer localRenderer;

	OllamaImageClient(OllamaProperties properties, BikeColorPreviewRenderer localRenderer) {
		this.properties = properties;
		this.localRenderer = localRenderer;
		SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
		requestFactory.setReadTimeout(Duration.ofSeconds(Math.max(30, properties.getImageTimeoutSeconds())));
		this.restClient = RestClient.builder()
				.baseUrl(properties.getBaseUrl())
				.requestFactory(requestFactory)
				.build();
	}

	Optional<byte[]> repaintBikePreview(String sourceImageBase64, String targetColor) {
		if (!StringUtils.hasText(sourceImageBase64) || !StringUtils.hasText(targetColor)) {
			return Optional.empty();
		}

		if (properties.isEnabled() && properties.isImageGenerationEnabled()) {
			Optional<byte[]> fromOllama = generateWithOllama(sourceImageBase64, targetColor);
			if (fromOllama.isPresent()) {
				return fromOllama;
			}
			log.info("Ollama image preview unavailable — using local bike recolor for {}", targetColor);
		}

		return localRenderer.recolorFromBase64(sourceImageBase64, targetColor);
	}

	private Optional<byte[]> generateWithOllama(String sourceImageBase64, String targetColor) {
		String prompt = """
				Edit this motorcycle photograph: repaint the bike body panels to glossy %s.
				Keep the same motorcycle model, camera angle, wheels, and background.
				Photorealistic showroom-quality motorcycle paint finish. No text or watermarks."""
				.formatted(targetColor.trim())
				.strip();
		try {
			OllamaGenerateResponse response = restClient.post()
					.uri("/api/generate")
					.contentType(MediaType.APPLICATION_JSON)
					.body(Map.of(
							"model", properties.getImageModel(),
							"prompt", prompt,
							"images", List.of(sourceImageBase64),
							"stream", false,
							"width", 768,
							"height", 768))
					.retrieve()
					.body(OllamaGenerateResponse.class);
			if (response == null || !StringUtils.hasText(response.image())) {
				log.warn("Ollama image model returned no image for color {}", targetColor);
				return Optional.empty();
			}
			return Optional.of(Base64.getDecoder().decode(response.image()));
		} catch (RestClientException ex) {
			log.warn("Ollama image generation failed: {}", ex.getMessage());
			return Optional.empty();
		}
	}

	private record OllamaGenerateResponse(String image) {
	}
}
