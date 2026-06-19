package com.gmw.General.Mechanical.Works.storage;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.gmw.General.Mechanical.Works.blog.Blog;
import com.gmw.General.Mechanical.Works.blog.BlogRepository;
import com.gmw.General.Mechanical.Works.offer.Offer;
import com.gmw.General.Mechanical.Works.offer.OfferRepository;
import com.gmw.General.Mechanical.Works.order.OrderLine;
import com.gmw.General.Mechanical.Works.order.ShopOrder;
import com.gmw.General.Mechanical.Works.order.ShopOrderRepository;
import com.gmw.General.Mechanical.Works.product.Product;
import com.gmw.General.Mechanical.Works.product.ProductJson;
import com.gmw.General.Mechanical.Works.product.ProductRepository;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService.Folder;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Component
@Order(100)
public class CloudinaryLocalMigrationRunner implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(CloudinaryLocalMigrationRunner.class);

	private final CloudinaryProperties cloudinaryProperties;
	private final ImageStorageService imageStorageService;
	private final ProductRepository productRepository;
	private final BlogRepository blogRepository;
	private final OfferRepository offerRepository;
	private final UserRepository userRepository;
	private final ShopOrderRepository shopOrderRepository;

	public CloudinaryLocalMigrationRunner(
			CloudinaryProperties cloudinaryProperties,
			ImageStorageService imageStorageService,
			ProductRepository productRepository,
			BlogRepository blogRepository,
			OfferRepository offerRepository,
			UserRepository userRepository,
			ShopOrderRepository shopOrderRepository) {
		this.cloudinaryProperties = cloudinaryProperties;
		this.imageStorageService = imageStorageService;
		this.productRepository = productRepository;
		this.blogRepository = blogRepository;
		this.offerRepository = offerRepository;
		this.userRepository = userRepository;
		this.shopOrderRepository = shopOrderRepository;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (!cloudinaryProperties.isConfigured() || !cloudinaryProperties.isMigrateLocalUploads()) {
			return;
		}

		int migrated = 0;
		migrated += migrateProducts();
		migrated += migrateBlogs();
		migrated += migrateOffers();
		migrated += migrateUsers();
		migrated += migrateOrderLines();

		if (migrated > 0) {
			log.info("Migrated {} local upload reference(s) to Cloudinary", migrated);
		}
	}

	private int migrateProducts() {
		int count = 0;
		for (Product product : productRepository.findAll()) {
			List<String> paths = ProductJson.readStringList(product.getImagePathsJson());
			List<String> updated = new ArrayList<>();
			boolean changed = false;
			for (String path : paths) {
				String migrated = migratePath(path);
				updated.add(migrated);
				if (pathChanged(path, migrated)) {
					changed = true;
					count++;
				}
			}
			if (changed) {
				product.setImagePathsJson(ProductJson.writeStringList(updated));
				productRepository.save(product);
			}
		}
		return count;
	}

	private int migrateBlogs() {
		int count = 0;
		for (Blog blog : blogRepository.findAll()) {
			String migrated = migratePath(blog.getImagePath());
			if (pathChanged(blog.getImagePath(), migrated)) {
				blog.setImagePath(migrated);
				blogRepository.save(blog);
				count++;
			}
		}
		return count;
	}

	private int migrateOffers() {
		int count = 0;
		for (Offer offer : offerRepository.findAll()) {
			String migrated = migratePath(offer.getImagePath());
			if (pathChanged(offer.getImagePath(), migrated)) {
				offer.setImagePath(migrated);
				offerRepository.save(offer);
				count++;
			}
		}
		return count;
	}

	private int migrateUsers() {
		int count = 0;
		for (User user : userRepository.findAll()) {
			boolean changed = false;
			String avatar = migratePath(user.getProfilePicture());
			if (pathChanged(user.getProfilePicture(), avatar)) {
				user.setProfilePicture(avatar);
				changed = true;
				count++;
			}
			String cover = migratePath(user.getCoverPhoto());
			if (pathChanged(user.getCoverPhoto(), cover)) {
				user.setCoverPhoto(cover);
				changed = true;
				count++;
			}
			if (changed) {
				userRepository.save(user);
			}
		}
		return count;
	}

	private int migrateOrderLines() {
		int count = 0;
		for (ShopOrder order : shopOrderRepository.findAllWithLinesOrderByPlacedAtDesc()) {
			boolean changed = false;
			for (OrderLine line : order.getLines()) {
				String migrated = migratePath(line.getImagePath());
				if (pathChanged(line.getImagePath(), migrated)) {
					line.setImagePath(migrated);
					changed = true;
					count++;
				}
			}
			if (changed) {
				shopOrderRepository.save(order);
			}
		}
		return count;
	}

	private static boolean pathChanged(String original, String migrated) {
		return !Objects.equals(migrated, original);
	}

	private String migratePath(String path) {
		if (!StringUtils.hasText(path) || !imageStorageService.isLocalUploadPath(path)) {
			return path;
		}
		Folder folder = Folder.fromLocalPath(path);
		if (folder == null) {
			return path;
		}
		Path localFile = imageStorageService.localPathForWebPath(path);
		if (localFile == null || !Files.isRegularFile(localFile)) {
			log.warn("Skipping migration; local file missing for {}", path);
			return path;
		}
		try {
			String cloudUrl = imageStorageService.uploadLocalFile(localFile, folder);
			imageStorageService.deleteIfStored(path);
			return cloudUrl;
		} catch (Exception ex) {
			log.warn("Could not migrate {}: {}", path, ex.getMessage());
			return path;
		}
	}
}
