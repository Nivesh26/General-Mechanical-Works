package com.gmw.General.Mechanical.Works.config;

import java.util.List;

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
						  `purpose` VARCHAR(32) NOT NULL DEFAULT 'LOGIN',
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

			Integer otpPurposeExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'otp'
					  AND COLUMN_NAME = 'purpose'
					""",
					Integer.class);
			if (otpPurposeExists == null || otpPurposeExists == 0) {
				jdbcTemplate.execute(
						"ALTER TABLE `otp` ADD COLUMN `purpose` VARCHAR(32) NOT NULL DEFAULT 'LOGIN'");
			}

			Integer shopOrderTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					""",
					Integer.class);
			if (shopOrderTableExists == null || shopOrderTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `shop_order` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `order_number` VARCHAR(32) NOT NULL,
						  `user_id` BIGINT NOT NULL,
						  `customer_name` VARCHAR(255) NOT NULL,
						  `customer_email` VARCHAR(255) NOT NULL,
						  `phone` VARCHAR(32) NULL,
						  `address` VARCHAR(512) NULL,
						  `placed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
						  `cancelled_at` DATETIME NULL,
						  `status` VARCHAR(32) NOT NULL DEFAULT 'PENDING',
						  `payment_method` VARCHAR(32) NOT NULL,
						  `subtotal` DECIMAL(12,2) NOT NULL,
						  `tax_amount` DECIMAL(12,2) NOT NULL,
						  `total` DECIMAL(12,2) NOT NULL,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_shop_order_number` (`order_number`),
						  KEY `idx_shop_order_user_id` (`user_id`),
						  CONSTRAINT `fk_shop_order_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}

			Integer orderLineTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'order_line'
					""",
					Integer.class);
			if (orderLineTableExists == null || orderLineTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `order_line` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `order_id` BIGINT NOT NULL,
						  `product_id` BIGINT NOT NULL,
						  `product_name` VARCHAR(255) NOT NULL,
						  `sku` VARCHAR(64) NOT NULL,
						  `quantity` INT NOT NULL,
						  `unit_price` DECIMAL(12,2) NOT NULL,
						  `size_label` VARCHAR(64) NOT NULL DEFAULT '',
						  `image_path` VARCHAR(1024) NULL,
						  `cancelled` TINYINT(1) NOT NULL DEFAULT 0,
						  `cancelled_at` DATETIME NULL,
						  PRIMARY KEY (`id`),
						  KEY `idx_order_line_order_id` (`order_id`),
						  CONSTRAINT `fk_order_line_order` FOREIGN KEY (`order_id`) REFERENCES `shop_order` (`id`) ON DELETE CASCADE
						) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
						""");
			}

			Integer shopOrderCancelledAtExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'cancelled_at'
					""",
					Integer.class);
			if (shopOrderCancelledAtExists == null || shopOrderCancelledAtExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `shop_order` ADD COLUMN `cancelled_at` DATETIME NULL");
			}

			Integer orderLineCancelledExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'order_line'
					  AND COLUMN_NAME = 'cancelled'
					""",
					Integer.class);
			if (orderLineCancelledExists == null || orderLineCancelledExists == 0) {
				jdbcTemplate.execute(
						"ALTER TABLE `order_line` ADD COLUMN `cancelled` TINYINT(1) NOT NULL DEFAULT 0");
			}

			Integer orderLineCancelledAtExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'order_line'
					  AND COLUMN_NAME = 'cancelled_at'
					""",
					Integer.class);
			if (orderLineCancelledAtExists == null || orderLineCancelledAtExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `order_line` ADD COLUMN `cancelled_at` DATETIME NULL");
			}

			List<String> orderLineProductFkNames = jdbcTemplate.queryForList(
					"""
					SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'order_line'
					  AND COLUMN_NAME = 'product_id'
					  AND REFERENCED_TABLE_NAME = 'product'
					""",
					String.class);
			for (String constraintName : orderLineProductFkNames) {
				if (constraintName != null && !constraintName.isBlank()) {
					jdbcTemplate.execute(
							"ALTER TABLE `order_line` DROP FOREIGN KEY `" + constraintName.replace("`", "") + "`");
				}
			}

			Integer shopOrderPaidExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'paid'
					""",
					Integer.class);
			if (shopOrderPaidExists == null || shopOrderPaidExists == 0) {
				jdbcTemplate.execute(
						"ALTER TABLE `shop_order` ADD COLUMN `paid` TINYINT(1) NOT NULL DEFAULT 1");
			}
			jdbcTemplate.update(
					"UPDATE `shop_order` SET `paid` = 1 WHERE `payment_method` = 'COD' AND `paid` = 0");
			jdbcTemplate.update("""
					UPDATE `shop_order`
					SET `status` = 'CANCELLED', `cancelled_at` = NOW(), `pending_cart_line_ids` = NULL
					WHERE `payment_method` = 'ESEWA' AND `paid` = 0 AND `status` = 'PENDING'
					""");

			Integer shopOrderEsewaUuidExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'esewa_transaction_uuid'
					""",
					Integer.class);
			if (shopOrderEsewaUuidExists == null || shopOrderEsewaUuidExists == 0) {
				jdbcTemplate.execute(
						"ALTER TABLE `shop_order` ADD COLUMN `esewa_transaction_uuid` VARCHAR(64) NULL");
				jdbcTemplate.execute(
						"ALTER TABLE `shop_order` ADD UNIQUE KEY `uk_shop_order_esewa_txn` (`esewa_transaction_uuid`)");
			}

			Integer shopOrderPendingCartExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'pending_cart_line_ids'
					""",
					Integer.class);
			if (shopOrderPendingCartExists == null || shopOrderPendingCartExists == 0) {
				jdbcTemplate.execute(
						"ALTER TABLE `shop_order` ADD COLUMN `pending_cart_line_ids` VARCHAR(512) NULL");
			}

			Integer shopOrderKhaltiPidxExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'khalti_pidx'
					""",
					Integer.class);
			if (shopOrderKhaltiPidxExists == null || shopOrderKhaltiPidxExists == 0) {
				jdbcTemplate.execute(
						"ALTER TABLE `shop_order` ADD COLUMN `khalti_pidx` VARCHAR(64) NULL");
				jdbcTemplate.execute(
						"ALTER TABLE `shop_order` ADD UNIQUE KEY `uk_shop_order_khalti_pidx` (`khalti_pidx`)");
			}
			jdbcTemplate.update("""
					UPDATE `shop_order`
					SET `status` = 'CANCELLED', `cancelled_at` = NOW(), `pending_cart_line_ids` = NULL
					WHERE `payment_method` = 'KHALTI' AND `paid` = 0 AND `status` = 'PENDING'
					""");

			Integer deliveredAtColumnExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'delivered_at'
					""",
					Integer.class);
			if (deliveredAtColumnExists == null || deliveredAtColumnExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `shop_order` ADD COLUMN `delivered_at` DATETIME NULL");
			}
			jdbcTemplate.update("""
					UPDATE `shop_order`
					SET `delivered_at` = `placed_at`
					WHERE `status` = 'DELIVERED' AND `delivered_at` IS NULL
					""");

			Integer confirmedAtColumnExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'confirmed_at'
					""",
					Integer.class);
			if (confirmedAtColumnExists == null || confirmedAtColumnExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `shop_order` ADD COLUMN `confirmed_at` DATETIME NULL");
			}
			Integer shippedAtColumnExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'shop_order'
					  AND COLUMN_NAME = 'shipped_at'
					""",
					Integer.class);
			if (shippedAtColumnExists == null || shippedAtColumnExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `shop_order` ADD COLUMN `shipped_at` DATETIME NULL");
			}
			jdbcTemplate.update("""
					UPDATE `shop_order`
					SET `confirmed_at` = `placed_at`
					WHERE `status` IN ('CONFIRMED', 'SHIPPED', 'DELIVERED') AND `confirmed_at` IS NULL
					""");
			jdbcTemplate.update("""
					UPDATE `shop_order`
					SET `shipped_at` = `placed_at`
					WHERE `status` IN ('SHIPPED', 'DELIVERED') AND `shipped_at` IS NULL
					""");

			jdbcTemplate.execute(
					"ALTER TABLE `product` MODIFY COLUMN `image_paths` TEXT NOT NULL");

			Integer reviewsTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'reviews'
					""",
					Integer.class);
			if (reviewsTableExists == null || reviewsTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `reviews` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `user_id` BIGINT NOT NULL,
						  `product_id` BIGINT NOT NULL,
						  `rating` INT NOT NULL,
						  `comment` TEXT NOT NULL,
						  `image_paths` TEXT NULL,
						  `admin_reply` TEXT NULL,
						  `like_count` INT NOT NULL DEFAULT 0,
						  `created_at` DATETIME(6) NOT NULL,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_reviews_user_product` (`user_id`, `product_id`),
						  CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE,
						  CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`) ON DELETE CASCADE
						)
						""");
			}

			Integer reviewLikeCountColumnExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'reviews'
					  AND COLUMN_NAME = 'like_count'
					""",
					Integer.class);
			if (reviewLikeCountColumnExists == null || reviewLikeCountColumnExists == 0) {
				jdbcTemplate.execute(
						"ALTER TABLE `reviews` ADD COLUMN `like_count` INT NOT NULL DEFAULT 0");
			}

			Integer reviewLikeTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'review_like'
					""",
					Integer.class);
			if (reviewLikeTableExists == null || reviewLikeTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `review_like` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `review_id` BIGINT NOT NULL,
						  `user_id` BIGINT NOT NULL,
						  `created_at` DATETIME(6) NOT NULL,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_review_like_review_user` (`review_id`, `user_id`),
						  CONSTRAINT `fk_review_like_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
						  CONSTRAINT `fk_review_like_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
						)
						""");
			}

			Integer serviceAppointmentTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'service_appointment'
					""",
					Integer.class);
			if (serviceAppointmentTableExists == null || serviceAppointmentTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `service_appointment` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `user_id` BIGINT NOT NULL,
						  `vehicle_id` BIGINT NOT NULL,
						  `mode` VARCHAR(16) NOT NULL,
						  `status` VARCHAR(16) NOT NULL,
						  `service_ids` TEXT NOT NULL,
						  `service_titles` TEXT NOT NULL,
						  `appointment_date` DATE NOT NULL,
						  `time_slot` VARCHAR(32) NOT NULL,
						  `bike_label` VARCHAR(255) NOT NULL,
						  `notes` TEXT NULL,
						  `pickup_lat` DOUBLE NULL,
						  `pickup_lng` DOUBLE NULL,
						  `created_at` DATETIME(6) NOT NULL,
						  PRIMARY KEY (`id`),
						  KEY `idx_service_appointment_user_id` (`user_id`),
						  KEY `idx_service_appointment_status` (`status`),
						  CONSTRAINT `fk_service_appointment_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
						)
						""");
			}

			Integer serviceAvailabilityTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'service_availability'
					""",
					Integer.class);
			if (serviceAvailabilityTableExists == null || serviceAvailabilityTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `service_availability` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `availability_date` DATE NOT NULL,
						  `time_slots_json` TEXT NOT NULL,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_service_availability_date` (`availability_date`)
						)
						""");
			}

			Integer pickupLatColumnExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'service_appointment'
					  AND COLUMN_NAME = 'pickup_lat'
					""",
					Integer.class);
			if (pickupLatColumnExists == null || pickupLatColumnExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `service_appointment` ADD COLUMN `pickup_lat` DOUBLE NULL");
			}

			Integer pickupLngColumnExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.COLUMNS
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'service_appointment'
					  AND COLUMN_NAME = 'pickup_lng'
					""",
					Integer.class);
			if (pickupLngColumnExists == null || pickupLngColumnExists == 0) {
				jdbcTemplate.execute("ALTER TABLE `service_appointment` ADD COLUMN `pickup_lng` DOUBLE NULL");
			}

			Integer billTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'bill'
					""",
					Integer.class);
			if (billTableExists == null || billTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `bill` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `invoice_number` VARCHAR(32) NOT NULL,
						  `issued_at` DATE NOT NULL,
						  `due_at` DATE NOT NULL,
						  `customer_name` VARCHAR(255) NOT NULL,
						  `customer_email` VARCHAR(255) NULL,
						  `customer_phone` VARCHAR(32) NULL,
						  `customer_address` TEXT NULL,
						  `discount_percent` DECIMAL(5,2) NOT NULL DEFAULT 0,
						  `payment_terms` VARCHAR(64) NOT NULL,
						  `lines_json` TEXT NOT NULL,
						  `created_at` DATETIME(6) NOT NULL,
						  `updated_at` DATETIME(6) NOT NULL,
						  PRIMARY KEY (`id`),
						  UNIQUE KEY `uk_bill_invoice_number` (`invoice_number`)
						)
						""");
			}

			Integer chatMessageTableExists = jdbcTemplate.queryForObject(
					"""
					SELECT COUNT(*) FROM information_schema.TABLES
					WHERE TABLE_SCHEMA = DATABASE()
					  AND TABLE_NAME = 'chat_message'
					""",
					Integer.class);
			if (chatMessageTableExists == null || chatMessageTableExists == 0) {
				jdbcTemplate.execute("""
						CREATE TABLE `chat_message` (
						  `id` BIGINT NOT NULL AUTO_INCREMENT,
						  `user_id` BIGINT NOT NULL,
						  `sender` VARCHAR(16) NOT NULL,
						  `body` TEXT NOT NULL,
						  `reply_to_id` BIGINT NULL,
						  `attachment_url` VARCHAR(1024) NULL,
						  `attachment_type` VARCHAR(16) NULL,
						  `attachment_name` VARCHAR(255) NULL,
						  `created_at` DATETIME(6) NOT NULL,
						  PRIMARY KEY (`id`),
						  KEY `idx_chat_message_user_created` (`user_id`, `created_at`)
						)
						""");
			}
			addChatAttachmentColumnsIfMissing(jdbcTemplate);
			addChatMessageHiddenTableIfMissing(jdbcTemplate);
			addChatConversationSettingsTableIfMissing(jdbcTemplate);
			addAdminAssistantMessageTableIfMissing(jdbcTemplate);
			addAdminAssistantAttachmentColumnsIfMissing(jdbcTemplate);
		};
	}

	private void addAdminAssistantMessageTableIfMissing(JdbcTemplate jdbcTemplate) {
		Integer tableExists = jdbcTemplate.queryForObject(
				"""
				SELECT COUNT(*) FROM information_schema.TABLES
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = 'admin_assistant_message'
				""",
				Integer.class);
		if (tableExists == null || tableExists == 0) {
			jdbcTemplate.execute("""
					CREATE TABLE `admin_assistant_message` (
					  `id` BIGINT NOT NULL AUTO_INCREMENT,
					  `admin_id` BIGINT NOT NULL,
					  `sender` VARCHAR(16) NOT NULL,
					  `body` TEXT NOT NULL,
					  `created_at` DATETIME(6) NOT NULL,
					  PRIMARY KEY (`id`),
					  KEY `idx_admin_assistant_admin_created` (`admin_id`, `created_at`),
					  CONSTRAINT `fk_admin_assistant_admin` FOREIGN KEY (`admin_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
					) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
					""");
		}
	}

	private void addAdminAssistantAttachmentColumnsIfMissing(JdbcTemplate jdbcTemplate) {
		addColumnIfMissing(jdbcTemplate, "admin_assistant_message", "attachment_url", "VARCHAR(1024) NULL");
		addColumnIfMissing(jdbcTemplate, "admin_assistant_message", "attachment_type", "VARCHAR(16) NULL");
		addColumnIfMissing(jdbcTemplate, "admin_assistant_message", "attachment_name", "VARCHAR(255) NULL");
	}

	private void addChatConversationSettingsTableIfMissing(JdbcTemplate jdbcTemplate) {
		Integer tableExists = jdbcTemplate.queryForObject(
				"""
				SELECT COUNT(*) FROM information_schema.TABLES
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = 'chat_conversation_settings'
				""",
				Integer.class);
		if (tableExists == null || tableExists == 0) {
			jdbcTemplate.execute("""
					CREATE TABLE `chat_conversation_settings` (
					  `user_id` BIGINT NOT NULL,
					  `ai_enabled` TINYINT(1) NOT NULL DEFAULT 1,
					  PRIMARY KEY (`user_id`),
					  CONSTRAINT `fk_chat_conversation_settings_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON DELETE CASCADE
					) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
					""");
		}
	}

	private void addChatMessageHiddenTableIfMissing(JdbcTemplate jdbcTemplate) {
		Integer tableExists = jdbcTemplate.queryForObject(
				"""
				SELECT COUNT(*) FROM information_schema.TABLES
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = 'chat_message_hidden'
				""",
				Integer.class);
		if (tableExists == null || tableExists == 0) {
			jdbcTemplate.execute("""
					CREATE TABLE `chat_message_hidden` (
					  `id` BIGINT NOT NULL AUTO_INCREMENT,
					  `message_id` BIGINT NOT NULL,
					  `hidden_by_user_id` BIGINT NOT NULL,
					  `hidden_at` DATETIME(6) NOT NULL,
					  PRIMARY KEY (`id`),
					  UNIQUE KEY `uk_chat_message_hidden` (`message_id`, `hidden_by_user_id`),
					  KEY `idx_chat_message_hidden_viewer` (`hidden_by_user_id`)
					)
					""");
		}
	}

	private void addChatAttachmentColumnsIfMissing(JdbcTemplate jdbcTemplate) {
		addColumnIfMissing(jdbcTemplate, "chat_message", "attachment_url", "VARCHAR(1024) NULL");
		addColumnIfMissing(jdbcTemplate, "chat_message", "attachment_type", "VARCHAR(16) NULL");
		addColumnIfMissing(jdbcTemplate, "chat_message", "attachment_name", "VARCHAR(255) NULL");
	}

	private void addColumnIfMissing(JdbcTemplate jdbcTemplate, String table, String column, String definition) {
		Integer exists = jdbcTemplate.queryForObject(
				"""
				SELECT COUNT(*) FROM information_schema.COLUMNS
				WHERE TABLE_SCHEMA = DATABASE()
				  AND TABLE_NAME = ?
				  AND COLUMN_NAME = ?
				""",
				Integer.class,
				table,
				column);
		if (exists == null || exists == 0) {
			jdbcTemplate.execute("ALTER TABLE `" + table + "` ADD COLUMN `" + column + "` " + definition);
		}
	}
}
