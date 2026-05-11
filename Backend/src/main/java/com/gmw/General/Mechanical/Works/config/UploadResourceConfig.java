package com.gmw.General.Mechanical.Works.config;

import java.nio.file.Path;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class UploadResourceConfig implements WebMvcConfigurer {

	@Override
	public void addResourceHandlers(ResourceHandlerRegistry registry) {
		Path uploadRoot = Path.of("uploads").toAbsolutePath().normalize();
		registry.addResourceHandler("/uploads/**")
				.addResourceLocations(uploadRoot.toUri().toString());
	}
}
