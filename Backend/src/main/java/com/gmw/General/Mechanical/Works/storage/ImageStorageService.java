package com.gmw.General.Mechanical.Works.storage;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Service
public class ImageStorageService {

	public enum Folder {
		PRODUCTS("gmw/products", "/uploads/products/"),
		BLOGS("gmw/blogs", "/uploads/blogs/"),
		OFFERS("gmw/offers", "/uploads/offers/"),
		PROFILES("gmw/profiles", "/uploads/profiles/"),
		COVERS("gmw/covers", "/uploads/covers/"),
		REVIEWS("gmw/reviews", "/uploads/reviews/");

		private final String cloudFolder;
		private final String localPrefix;

		Folder(String cloudFolder, String localPrefix) {
			this.cloudFolder = cloudFolder;
			this.localPrefix = localPrefix;
		}

		public String cloudFolder() {
			return cloudFolder;
		}

		public String localPrefix() {
			return localPrefix;
		}

		public static Folder fromLocalPath(String path) {
			if (!StringUtils.hasText(path)) {
				return null;
			}
			for (Folder folder : values()) {
				if (path.startsWith(folder.localPrefix)) {
					return folder;
				}
			}
			return null;
		}
	}

	private static final Set<String> DEFAULT_ALLOWED_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif");

	private final CloudinaryProperties cloudinaryProperties;
	private final Cloudinary cloudinary;

	public ImageStorageService(
			CloudinaryProperties cloudinaryProperties,
			ObjectProvider<Cloudinary> cloudinaryProvider) {
		this.cloudinaryProperties = cloudinaryProperties;
		this.cloudinary = cloudinaryProvider.getIfAvailable();
	}

	public String upload(MultipartFile file, Folder folder, int maxBytes) {
		return upload(file, folder, maxBytes, DEFAULT_ALLOWED_TYPES);
	}

	public String upload(MultipartFile file, Folder folder, int maxBytes, Set<String> allowedTypes) {
		requireConfigured();
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "File is required");
		}
		if (file.getSize() > maxBytes) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Image must be " + (maxBytes / (1024 * 1024)) + " MB or smaller");
		}
		String contentType = file.getContentType();
		if (contentType == null || !allowedTypes.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use JPEG, PNG, WebP, or GIF");
		}
		try {
			@SuppressWarnings("unchecked")
			Map<String, Object> result = cloudinary.uploader().upload(file.getBytes(), uploadParams(folder));
			return String.valueOf(result.get("secure_url"));
		} catch (IOException ex) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not read uploaded file");
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Could not upload image to Cloudinary");
		}
	}

	public String uploadLocalFile(Path file, Folder folder) {
		requireConfigured();
		if (!Files.isRegularFile(file)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Local image file not found: " + file);
		}
		try {
			@SuppressWarnings("unchecked")
			Map<String, Object> result = cloudinary.uploader().upload(file.toFile(), uploadParams(folder));
			return String.valueOf(result.get("secure_url"));
		} catch (Exception ex) {
			throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
					"Could not migrate image to Cloudinary: " + file.getFileName());
		}
	}

	public void deleteIfStored(String urlOrPath) {
		if (!StringUtils.hasText(urlOrPath)) {
			return;
		}
		if (isCloudinaryUrl(urlOrPath)) {
			deleteFromCloudinary(urlOrPath);
			return;
		}
		if (isLocalUploadPath(urlOrPath)) {
			deleteLocalFile(urlOrPath);
		}
	}

	public boolean isLocalUploadPath(String path) {
		return StringUtils.hasText(path) && path.startsWith("/uploads/");
	}

	public boolean isCloudinaryUrl(String url) {
		return StringUtils.hasText(url)
				&& (url.startsWith("https://res.cloudinary.com/") || url.startsWith("http://res.cloudinary.com/"));
	}

	public Path localPathForWebPath(String webPath) {
		if (!isLocalUploadPath(webPath)) {
			return null;
		}
		Path relative = Path.of(webPath.replaceFirst("^/", ""));
		return Path.of("").toAbsolutePath().resolve(relative).normalize();
	}

	private void requireConfigured() {
		if (!cloudinaryProperties.isConfigured() || cloudinary == null) {
			throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
					"Cloudinary is not configured. Set app.cloudinary.cloud-name, api-key, and api-secret.");
		}
	}

	private Map<?, ?> uploadParams(Folder folder) {
		return ObjectUtils.asMap(
				"folder", folder.cloudFolder(),
				"public_id", UUID.randomUUID().toString(),
				"overwrite", false,
				"resource_type", "image");
	}

	private void deleteFromCloudinary(String secureUrl) {
		if (!cloudinaryProperties.isConfigured() || cloudinary == null) {
			return;
		}
		String publicId = extractPublicId(secureUrl);
		if (!StringUtils.hasText(publicId)) {
			return;
		}
		try {
			cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
		} catch (Exception ignored) {
			// Non-fatal cleanup failure.
		}
	}

	private static void deleteLocalFile(String webPath) {
		Path filePath = Path.of("").toAbsolutePath().resolve(webPath.substring(1)).normalize();
		Path uploadsRoot = Path.of("uploads").toAbsolutePath().normalize();
		if (!filePath.startsWith(uploadsRoot)) {
			return;
		}
		try {
			Files.deleteIfExists(filePath);
		} catch (IOException ignored) {
			// Non-fatal cleanup failure.
		}
	}

	static String extractPublicId(String secureUrl) {
		int uploadIdx = secureUrl.indexOf("/upload/");
		if (uploadIdx < 0) {
			return null;
		}
		String afterUpload = secureUrl.substring(uploadIdx + "/upload/".length());
		if (afterUpload.startsWith("v") && afterUpload.contains("/")) {
			afterUpload = afterUpload.substring(afterUpload.indexOf('/') + 1);
		}
		int queryIdx = afterUpload.indexOf('?');
		if (queryIdx >= 0) {
			afterUpload = afterUpload.substring(0, queryIdx);
		}
		int dotIdx = afterUpload.lastIndexOf('.');
		if (dotIdx > afterUpload.lastIndexOf('/')) {
			afterUpload = afterUpload.substring(0, dotIdx);
		}
		return afterUpload.isBlank() ? null : afterUpload;
	}
}
