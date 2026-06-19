package com.gmw.General.Mechanical.Works.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.storage.ImageStorageService;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService.Folder;

@Service
public class ProductService {

	public static final int MAX_IMAGE_BYTES = 5 * 1024 * 1024;
	public static final int MAX_IMAGES = 4;
	public static final int MAX_DESCRIPTION_LENGTH = 5000;
	public static final int MAX_BULLET_POINTS_LENGTH = 8000;

	private final ProductRepository productRepository;
	private final ImageStorageService imageStorageService;

	public ProductService(ProductRepository productRepository, ImageStorageService imageStorageService) {
		this.productRepository = productRepository;
		this.imageStorageService = imageStorageService;
	}

	@Transactional(readOnly = true)
	public List<ProductDto> listActive() {
		return productRepository.findAllByActiveTrueOrderByCreatedAtDesc().stream()
				.map(ProductMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<ProductDto> listAllForAdmin() {
		return productRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(ProductMapper::toDto)
				.toList();
	}

	@Transactional(readOnly = true)
	public ProductDto getActiveById(Long id) {
		return productRepository.findByIdAndActiveTrue(id)
				.map(ProductMapper::toDto)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
	}

	@Transactional
	public ProductDto create(
			String sku,
			String name,
			String description,
			String bulletPointsRaw,
			String category,
			String sizesRaw,
			BigDecimal price,
			int stock,
			List<MultipartFile> files) {
		validateFields(sku, name, description, bulletPointsRaw, category, price, stock, null);
		ensureUniqueSku(sku, null);
		List<String> imagePaths = storeImages(files, List.of());
		if (imagePaths.size() > MAX_IMAGES) {
			deleteStoredPaths(imagePaths);
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can upload at most 4 images");
		}

		Product product = new Product();
		applyFields(product, sku, name, description, bulletPointsRaw, category, sizesRaw, price, stock);
		product.setImagePathsJson(ProductJson.writeStringList(imagePaths));
		product.setActive(true);
		product.setCreatedAt(LocalDateTime.now());
		return saveProduct(product);
	}

	@Transactional
	public ProductDto update(
			Long id,
			String sku,
			String name,
			String description,
			String bulletPointsRaw,
			String category,
			String sizesRaw,
			BigDecimal price,
			int stock,
			List<String> keepImagePaths,
			List<MultipartFile> files) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
		validateFields(sku, name, description, bulletPointsRaw, category, price, stock, id);
		ensureUniqueSku(sku, id);

		List<String> currentPaths = ProductJson.readStringList(product.getImagePathsJson());
		List<String> imagePaths = resolveUpdatedImagePaths(currentPaths, keepImagePaths, files);

		applyFields(product, sku, name, description, bulletPointsRaw, category, sizesRaw, price, stock);
		product.setImagePathsJson(ProductJson.writeStringList(imagePaths));
		return saveProduct(product);
	}

	private List<String> resolveUpdatedImagePaths(
			List<String> currentPaths,
			List<String> keepImagePaths,
			List<MultipartFile> files) {
		List<String> base;
		if (keepImagePaths != null) {
			List<String> kept = keepImagePaths.stream().filter(StringUtils::hasText).toList();
			for (String path : kept) {
				if (!currentPaths.contains(path)) {
					throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image reference");
				}
			}
			base = new ArrayList<>(kept);
			List<String> removed = currentPaths.stream().filter(path -> !base.contains(path)).toList();
			deleteStoredPaths(removed);
		} else if (files != null && !files.isEmpty()) {
			deleteStoredPaths(currentPaths);
			base = new ArrayList<>();
		} else {
			base = new ArrayList<>(currentPaths);
		}

		List<String> added = new ArrayList<>();
		if (files != null && !files.isEmpty()) {
			for (MultipartFile file : files) {
				if (file == null || file.isEmpty()) {
					continue;
				}
				added.add(imageStorageService.upload(file, Folder.PRODUCTS, MAX_IMAGE_BYTES));
			}
			base.addAll(added);
		}

		if (base.size() > MAX_IMAGES) {
			deleteStoredPaths(added);
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You can upload at most 4 images");
		}
		return base;
	}

	@Transactional
	public ProductDto setActive(Long id, boolean active) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
		product.setActive(active);
		return ProductMapper.toDto(productRepository.save(product));
	}

	@Transactional
	public void delete(Long id) {
		Product product = productRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found"));
		deleteStoredPaths(ProductJson.readStringList(product.getImagePathsJson()));
		productRepository.delete(product);
	}

	private void applyFields(
			Product product,
			String sku,
			String name,
			String description,
			String bulletPointsRaw,
			String category,
			String sizesRaw,
			BigDecimal price,
			int stock) {
		product.setSku(sku.trim().toUpperCase(Locale.ROOT));
		product.setName(name.trim());
		product.setDescription(description.trim());
		product.setBulletPointsJson(ProductJson.writeStringList(parseBulletPoints(bulletPointsRaw)));
		product.setCategory(category.trim());
		product.setSizesJson(ProductJson.writeStringList(parseSizes(sizesRaw)));
		product.setPrice(price);
		product.setStock(stock);
	}

	private static List<String> parseBulletPoints(String raw) {
		if (!StringUtils.hasText(raw)) {
			return List.of();
		}
		return raw.lines()
				.map(String::trim)
				.filter(StringUtils::hasText)
				.toList();
	}

	private static List<String> parseSizes(String raw) {
		if (!StringUtils.hasText(raw)) {
			return List.of();
		}
		return List.of(raw.split(","))
				.stream()
				.map(String::trim)
				.filter(StringUtils::hasText)
				.distinct()
				.toList();
	}

	private ProductDto saveProduct(Product product) {
		try {
			return ProductMapper.toDto(productRepository.save(product));
		} catch (DataIntegrityViolationException ex) {
			String msg = ex.getMostSpecificCause().getMessage();
			String lower = msg != null ? msg.toLowerCase() : "";
			if (lower.contains("sku") || lower.contains("duplicate")) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This SKU is already in use");
			}
			if (lower.contains("description") || lower.contains("data too long") || lower.contains("truncation")) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
						"Product description or details are too long. Please shorten and try again.");
			}
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Could not save product. Please check your data.");
		}
	}

	private void validateFields(
			String sku,
			String name,
			String description,
			String bulletPointsRaw,
			String category,
			BigDecimal price,
			int stock,
			Long editingId) {
		if (!StringUtils.hasText(sku)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "SKU is required");
		}
		if (!StringUtils.hasText(name)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Product name is required");
		}
		if (!StringUtils.hasText(description)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Description is required");
		}
		if (description.length() > MAX_DESCRIPTION_LENGTH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
					"Description must be at most " + MAX_DESCRIPTION_LENGTH + " characters");
		}
		if (bulletPointsRaw != null && bulletPointsRaw.length() > MAX_BULLET_POINTS_LENGTH) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Bullet points text is too long");
		}
		if (!StringUtils.hasText(category)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category is required");
		}
		if (price == null || price.compareTo(BigDecimal.ZERO) <= 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Enter a valid price greater than 0");
		}
		if (stock < 0) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Stock must be 0 or more");
		}
	}

	private void ensureUniqueSku(String sku, Long editingId) {
		String normalized = sku.trim().toUpperCase(Locale.ROOT);
		boolean taken = editingId == null
				? productRepository.existsBySku(normalized)
				: productRepository.existsBySkuAndIdNot(normalized, editingId);
		if (taken) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This SKU is already in use");
		}
	}

	private List<String> storeImages(List<MultipartFile> files, List<String> currentWebPaths) {
		if (files == null || files.isEmpty()) {
			return new ArrayList<>(currentWebPaths);
		}
		List<String> paths = new ArrayList<>();
		for (MultipartFile file : files) {
			if (file == null || file.isEmpty()) {
				continue;
			}
			paths.add(imageStorageService.upload(file, Folder.PRODUCTS, MAX_IMAGE_BYTES));
		}
		return paths;
	}

	private void deleteStoredPaths(List<String> webPaths) {
		if (webPaths == null) {
			return;
		}
		for (String webPath : webPaths) {
			imageStorageService.deleteIfStored(webPath);
		}
	}
}
