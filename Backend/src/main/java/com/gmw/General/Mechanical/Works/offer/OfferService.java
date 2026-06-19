package com.gmw.General.Mechanical.Works.offer;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.storage.ImageStorageService;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService.Folder;

@Service
public class OfferService {

	public static final int MAX_IMAGE_BYTES = (int) (2.5 * 1024 * 1024);

	private final OfferRepository offerRepository;
	private final ImageStorageService imageStorageService;

	public OfferService(OfferRepository offerRepository, ImageStorageService imageStorageService) {
		this.offerRepository = offerRepository;
		this.imageStorageService = imageStorageService;
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
		offer.setImagePath(imageStorageService.upload(file, Folder.OFFERS, MAX_IMAGE_BYTES));
		offer.setCreatedAt(LocalDateTime.now());
		return OfferMapper.toDto(offerRepository.save(offer));
	}

	@Transactional
	public void delete(Long id) {
		Offer offer = offerRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Offer not found"));
		imageStorageService.deleteIfStored(offer.getImagePath());
		offerRepository.delete(offer);
	}

	private static void requireImage(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Poster image is required");
		}
	}
}
