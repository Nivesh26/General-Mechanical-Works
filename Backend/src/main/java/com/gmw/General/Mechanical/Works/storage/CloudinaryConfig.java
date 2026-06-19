package com.gmw.General.Mechanical.Works.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

@Configuration
@ConditionalOnProperty(prefix = "app.cloudinary", name = "cloud-name")
public class CloudinaryConfig {

	@Bean
	Cloudinary cloudinary(CloudinaryProperties properties) {
		return new Cloudinary(ObjectUtils.asMap(
				"cloud_name", properties.getCloudName().trim(),
				"api_key", properties.getApiKey().trim(),
				"api_secret", properties.getApiSecret().trim(),
				"secure", true));
	}
}
