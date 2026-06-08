package com.gmw.General.Mechanical.Works.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.jdbc.core.JdbcTemplate;

@Configuration
public class SchemaMigrationConfig {

	@Bean
	public CommandLineRunner ensureAvatarColumns(JdbcTemplate jdbcTemplate) {
		return args -> {
			Integer profileImageExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'user'
					  AND COLUMN_NAME = 'profile_image'
					""",
					Integer.class);
			if (profileImageExists != null && profileImageExists > 0) {
				jdbcTemplate.execute("ALTER TABLE `user` DROP COLUMN `profile_image`");
			}

			Integer profileImageContentTypeExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'user'
					  AND COLUMN_NAME = 'profile_image_content_type'
					""",
					Integer.class);
			if (profileImageContentTypeExists != null && profileImageContentTypeExists > 0) {
				jdbcTemplate.execute("ALTER TABLE `user` DROP COLUMN `profile_image_content_type`");
			}

			Integer profilePictureExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'user'
					  AND COLUMN_NAME = 'profile_picture'
					""",
					Integer.class);
			if (profilePictureExists == null || profilePictureExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `user` ADD COLUMN `profile_picture` VARCHAR(1024) NULL");
			}

			Integer coverPhotoExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'user'
					  AND COLUMN_NAME = 'cover_photo'
					""",
					Integer.class);
			if (coverPhotoExists == null || coverPhotoExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `user` ADD COLUMN `cover_photo` VARCHAR(1024) NULL");
			}

			Integer vehicleTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'vehicle'
					""",
					Integer.class);
			if (vehicleTableExists == null || vehicleTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `vehicle` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `user_id` BIGINT NOT NULL,
						  `company` VARCHAR(64) NOT NULL,
						  `model` VARCHAR(64) NOT NULL,
						  `plate` VARCHAR(128) NOT NULL,
						  `color` VARCHAR(32) NULL,
						  `plate_format` VARCHAR(16) NOT NULL,
						  `is_main_bike` TINYINT(1) NOT NULL DEFAULT 0,
						  `embossed_province` VARCHAR(64) NULL,
						  `embossed_category` VARCHAR(8) NULL,
						  `embossed_lot` VARCHAR(8) NULL,
						  `embossed_digits` VARCHAR(16) NULL,
						  `traditional_zone` VARCHAR(16) NULL,
						  `traditional_lot` VARCHAR(16) NULL,
						  `traditional_category` VARCHAR(16) NULL,
						  `traditional_digits` VARCHAR(16) NULL,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_vehicle_user_plate` (`user_id`, `plate`),
						  CONSTRAINT `fk_vehicle_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}

			Integer blogsTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'blogs'
					""",
					Integer.class);
			if (blogsTableExists == null || blogsTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `blogs` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `title` VARCHAR(512) NOT NULL,
						  `date_label` VARCHAR(64) NOT NULL,
						  `body` TEXT NOT NULL,
						  `image_path` VARCHAR(1024) NOT NULL,
						  `like_count` INT NOT NULL DEFAULT 0,
						  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
						  PRIMARY KEY (`id`)
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}

			Integer blogLikeTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'blog_like'
					""",
					Integer.class);
			if (blogLikeTableExists == null || blogLikeTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `blog_like` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `blog_id` BIGINT NOT NULL,
						  `user_id` BIGINT NOT NULL,
						  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_blog_like_blog_user` (`blog_id`, `user_id`),
						  CONSTRAINT `fk_blog_like_blog` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE,
						  CONSTRAINT `fk_blog_like_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}

			Integer offerTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'offer'
					""",
					Integer.class);
			if (offerTableExists == null || offerTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `offer` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `description` VARCHAR(512) NOT NULL,
						  `image_path` VARCHAR(1024) NOT NULL,
						  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
						  PRIMARY KEY (`id`)
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}

			Integer cartTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'cart'
					""",
					Integer.class);
			if (cartTableExists == null || cartTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `cart` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `user_id` BIGINT NOT NULL,
						  `product_id` BIGINT NOT NULL,
						  `quantity` INT NOT NULL DEFAULT 1,
						  `size_label` VARCHAR(64) NOT NULL DEFAULT '',
						  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
						  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_cart_user_product_size` (`user_id`, `product_id`, `size_label`),
						  CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
						  CONSTRAINT `fk_cart_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}

			Integer otpTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'otp'
					""",
					Integer.class);
			if (otpTableExists == null || otpTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `otp` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `verification_token` VARCHAR(36) NOT NULL,
						  `user_id` BIGINT NOT NULL,
						  `email` VARCHAR(255) NOT NULL,
						  `code` VARCHAR(6) NOT NULL,
						  `expires_at` DATETIME NOT NULL,
						  `last_sent_at` DATETIME NOT NULL,
						  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_otp_verification_token` (`verification_token`),
						  KEY `idx_otp_user_id` (`user_id`),
						  CONSTRAINT `fk_otp_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}
		};
	}
}
