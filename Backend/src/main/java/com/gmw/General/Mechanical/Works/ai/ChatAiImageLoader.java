package com.gmw.General.Mechanical.Works.ai;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import com.gmw.General.Mechanical.Works.storage.ImageStorageService;

@Component
class ChatAiImageLoader {

	private static final Logger log = LoggerFactory.getLogger(ChatAiImageLoader.class);

	private final ImageStorageService imageStorageService;
	private final RestClient restClient;

	ChatAiImageLoader(ImageStorageService imageStorageService) {
		this.imageStorageService = imageStorageService;
		this.restClient = RestClient.create();
	}

	Optional<String> loadBase64(String attachmentUrl) {
		return loadNormalizedBase64(attachmentUrl);
	}

	Optional<String> loadNormalizedBase64(String attachmentUrl) {
		if (!StringUtils.hasText(attachmentUrl)) {
			return Optional.empty();
		}
		try {
			byte[] bytes = readBytes(attachmentUrl.trim());
			if (bytes == null || bytes.length == 0) {
				return Optional.empty();
			}
			String encoded = ChatAiVisionImageEncoder.toVisionBase64(bytes);
			if (!StringUtils.hasText(encoded)) {
				return Optional.empty();
			}
			return Optional.of(encoded);
		} catch (Exception ex) {
			log.warn("Could not load chat image {}: {}", attachmentUrl, ex.getMessage());
			return Optional.empty();
		}
	}

	private byte[] readBytes(String attachmentUrl) throws Exception {
		if (imageStorageService.isLocalUploadPath(attachmentUrl)) {
			Path path = imageStorageService.localPathForWebPath(attachmentUrl);
			if (path == null || !Files.isRegularFile(path)) {
				return null;
			}
			return Files.readAllBytes(path);
		}
		if (attachmentUrl.startsWith("http://") || attachmentUrl.startsWith("https://")) {
			return restClient.get().uri(visionFetchUrl(attachmentUrl)).retrieve().body(byte[].class);
		}
		return null;
	}

	private String visionFetchUrl(String attachmentUrl) {
		if (!imageStorageService.isCloudinaryUrl(attachmentUrl)) {
			return attachmentUrl;
		}
		String marker = "/upload/";
		int idx = attachmentUrl.indexOf(marker);
		if (idx < 0) {
			return attachmentUrl;
		}
		String afterUpload = attachmentUrl.substring(idx + marker.length());
		if (afterUpload.startsWith("f_jpg") || afterUpload.contains("/f_jpg,")) {
			return attachmentUrl;
		}
		return attachmentUrl.substring(0, idx + marker.length()) + "f_jpg,q_auto:good,w_1024/" + afterUpload;
	}
}
