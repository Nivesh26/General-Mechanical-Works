package com.gmw.General.Mechanical.Works;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.gmw.General.Mechanical.Works.config.EmailProperties;
import com.gmw.General.Mechanical.Works.config.JwtProperties;
import com.gmw.General.Mechanical.Works.payment.AppUrlProperties;
import com.gmw.General.Mechanical.Works.payment.EsewaProperties;
import com.gmw.General.Mechanical.Works.payment.KhaltiProperties;
import com.gmw.General.Mechanical.Works.storage.CloudinaryProperties;

@SpringBootApplication
@EnableConfigurationProperties({
		JwtProperties.class,
		EmailProperties.class,
		EsewaProperties.class,
		KhaltiProperties.class,
		AppUrlProperties.class,
		CloudinaryProperties.class })
public class GeneralMechanicalWorksApplication {

	public static void main(String[] args) {
		SpringApplication.run(GeneralMechanicalWorksApplication.class, args);
	}

}
