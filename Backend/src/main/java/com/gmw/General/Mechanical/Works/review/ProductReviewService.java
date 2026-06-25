package com.gmw.General.Mechanical.Works.review;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.product.Product;
import com.gmw.General.Mechanical.Works.product.ProductJson;
import com.gmw.General.Mechanical.Works.product.ProductRepository;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService.Folder;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class ProductReviewService {

	private static final int MAX_REVIEW_IMAGES = 2;
	private static final int MAX_REVIEW_IMAGE_BYTES = 2 * 1024 * 1024;

	private final ProductReviewRepository productReviewRepository;
	private final ProductRepository productRepository;
	private final UserRepository userRepository;
	private final ImageStorageService imageStorageService;

	public ProductReviewService(
			ProductReviewRepository productReviewRepository,
			ProductRepository productRepository,
			UserRepository userRepository,
			ImageStorageService imageStorageService) {
		this.productReviewRepository = productReviewRepository;
		this.productRepository = productRepository;
		this.userRepository = userRepository;
		this.imageStorageService = imageStorageService;
	}

	@Transactional(readOnly = true)
	public List<ProductReviewDto> listForProduct(Long productId) {
		requireActiveProduct(productId);
		return productReviewRepository.findByProductIdWithUserOrderByCreatedAtDesc(productId).stream()
				.map(ProductReviewMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ProductReviewDto> listAllForAdmin() {
		return productReviewRepository.findAllWithUserAndProductOrderByCreatedAtDesc().stream()
				.map(ProductReviewMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public ReviewEligibilityDto getEligibility(String email, Long productId) {
		requireActiveProduct(productId);
		User user = requireUser(email);
		boolean hasDelivered = productReviewRepository.userHasDeliveredProduct(user.getId(), productId);
		boolean alreadyReviewed = productReviewRepository.existsByUser_IdAndProduct_Id(user.getId(), productId);
		return new ReviewEligibilityDto(hasDelivered && !alreadyReviewed, alreadyReviewed, hasDelivered);
	}

	@Transactional
	public ProductReviewDto create(String email, Long productId, int rating, String comment, List<MultipartFile> images) {
		if (rating < 1 || rating > 5) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 5");
		}
		String trimmedComment = comment != null ? comment.trim() : "";
		if (!StringUtils.hasText(trimmedComment)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Review comment is required");
		}

		Product product = requireActiveProduct(productId);
		User user = requireUser(email);

		if (!productReviewRepository.userHasDeliveredProduct(user.getId(), productId)) {
			throw new ResponseStatusException(HttpStatus.FORBIDDEN,
					"You can review this product only after it has been delivered");
		}
		if (productReviewRepository.existsByUser_IdAndProduct_Id(user.getId(), productId)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already reviewed this product");
		}

		List<String> storedImages = storeReviewImages(images);

		ProductReview review = new ProductReview();
		review.setUser(user);
		review.setProduct(product);
		review.setRating(rating);
		review.setComment(trimmedComment);
		review.setImagePathsJson(ProductJson.writeStringList(storedImages));

		ProductReview saved = productReviewRepository.save(review);
		return ProductReviewMapper.toDto(saved);
	}

	@Transactional
	public ProductReviewDto setAdminReply(Long reviewId, String reply) {
		ProductReview review = productReviewRepository.findByIdWithDetails(reviewId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
		String trimmed = reply != null ? reply.trim() : "";
		review.setAdminReply(StringUtils.hasText(trimmed) ? trimmed : null);
		return ProductReviewMapper.toDto(productReviewRepository.save(review));
	}

	@Transactional
	public void deleteForAdmin(Long reviewId) {
		ProductReview review = productReviewRepository.findById(reviewId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Review not found"));
		ProductJson.readStringList(review.getImagePathsJson())
				.forEach(imageStorageService::deleteIfStored);
		productReviewRepository.delete(review);
	}

	private List<String> storeReviewImages(List<MultipartFile> images) {
		if (images == null || images.isEmpty()) {
			return List.of();
		}
		if (images.size() > MAX_REVIEW_IMAGES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"You can upload at most " + MAX_REVIEW_IMAGES + " images");
		}
		List<String> stored = new ArrayList<>();
		for (MultipartFile file : images) {
			if (file == null || file.isEmpty()) {
				continue;
			}
			stored.add(imageStorageService.upload(file, Folder.REVIEWS, MAX_REVIEW_IMAGE_BYTES));
		}
		if (stored.size() > MAX_REVIEW_IMAGES) {
			stored.forEach(imageStorageService::deleteIfStored);
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"You can upload at most " + MAX_REVIEW_IMAGES + " images");
		}
		return stored;
	}

	private Product requireActiveProduct(Long productId) {
		Product product = productRepository.findById(productId)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
		if (!product.isActive()) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found");
		}
		return product;
	}

	private User requireUser(String email) {
		return userRepository.findByEmailIgnoreCase(email.trim().toLowerCase())
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
	}

	static final class ProductReviewMapper {

		private ProductReviewMapper() {
		}

		static ProductReviewDto toDto(ProductReview review) {
			Product product = review.getProduct();
			User user = review.getUser();
			List<String> productImages = product.getImagePathsList();
			return new ProductReviewDto(
					review.getId(),
					product.getId(),
					product.getName(),
					product.getDescription(),
					productImages.isEmpty() ? null : productImages.get(0),
					user.getProfilePicture(),
					user.getName(),
					review.getRating(),
					review.getComment(),
					ProductJson.readStringList(review.getImagePathsJson()),
					review.getAdminReply(),
					review.getCreatedAt().toLocalDate().format(
							java.time.format.DateTimeFormatter.ofPattern("d MMM yyyy", Locale.ENGLISH)));
		}
	}
}
