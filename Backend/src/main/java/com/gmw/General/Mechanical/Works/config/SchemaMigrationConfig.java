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
		};
	}
}
