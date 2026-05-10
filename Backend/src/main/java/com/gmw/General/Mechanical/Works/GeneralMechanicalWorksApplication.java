package com.gmw.General.Mechanical.Works;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.gmw.General.Mechanical.Works.config.JwtProperties;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class GeneralMechanicalWorksApplication {

	public static void main(String[] args) {
		SpringApplication.run(GeneralMechanicalWorksApplication.class, args);
	}

}
