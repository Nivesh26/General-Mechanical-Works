package com.gmw.General.Mechanical.Works.offer;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class OfferService {

	public static final int MAX_IMAGE_BYTES = (int) (2.5 * 1024 * 1024);

	private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif");
	private static final String OFFER_WEB_PREFIX = "/uploads/offers/";
	private static final Path OFFER_STORAGE_DIR = Path.of("uploads", "offers");

	private final OfferRepository offerRepository;

	public OfferService(OfferRepository offerRepository) {
		this.offerRepository = offerRepository;
	}

	@Transactional(readOnly = true)
	public List<OfferDto> listAll() {
		return offerRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(OfferMapper::toDto)
				.toList();
	}

	@Transactional
	public OfferDto create(String description, MultipartFile file) {
		requireImage(file);
		if (!StringUtils.hasText(description)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
		}
		Offer offer = new Offer();
		offer.setDescription(description.trim());
		offer.setImagePath(storeImage(file, null));
		offer.setCreatedAt(LocalDateTime.now());
		return OfferMapper.toDto(offerRepository.save(offer));
	}

	@Transactional
	public void delete(Long id) {
		Offer offer = offerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));
		deleteStoredFileIfAny(offer.getImagePath());
		offerRepository.delete(offer);
	}

	private static void requireImage(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Poster image is required");
		}
	}

	private static String extensionFor(String contentType) {
		return switch (contentType) {
			case "image/jpeg" -> ".jpg";
			case "image/png" -> ".png";
			case "image/webp" -> ".webp";
			case "image/gif" -> ".gif";
			default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use JPEG, PNG, WebP, or GIF");
		};
	}

	private static void deleteStoredFileIfAny(String webPath) {
		if (!StringUtils.hasText(webPath)) {
			return;
		}
		if (!webPath.startsWith(OFFER_WEB_PREFIX)) {
			return;
		}
		String fileName = webPath.substring(OFFER_WEB_PREFIX.length());
		if (fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) {
			return;
		}
		Path filePath = OFFER_STORAGE_DIR.resolve(fileName).normalize();
		if (!filePath.startsWith(OFFER_STORAGE_DIR.normalize())) {
			return;
		}
		try {
			Files.deleteIfExists(filePath);
		} catch (IOException ignored) {
			// Non-fatal cleanup failure.
		}
	}

	private String storeImage(MultipartFile file, String currentWebPath) {
		if (file.getSize() > MAX_IMAGE_BYTES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be 2.5 MB or smaller");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use JPEG, PNG, WebP, or GIF");
		}
		deleteStoredFileIfAny(currentWebPath);
		String ext = extensionFor(contentType.toLowerCase(Locale.ROOT));
		String fileName = UUID.randomUUID() + ext;
		Path destination = OFFER_STORAGE_DIR.resolve(fileName);
		try {
			Files.createDirectories(OFFER_STORAGE_DIR);
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
		}
		return OFFER_WEB_PREFIX + fileName;
	}
}
