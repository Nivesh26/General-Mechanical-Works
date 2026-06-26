package com.gmw.General.Mechanical.Works.appointment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ServiceAvailabilityCleanupRunner implements ApplicationRunner {

	private static final Logger log = LoggerFactory.getLogger(ServiceAvailabilityCleanupRunner.class);

	private final ServiceAvailabilityService serviceAvailabilityService;

	public ServiceAvailabilityCleanupRunner(ServiceAvailabilityService serviceAvailabilityService) {
		this.serviceAvailabilityService = serviceAvailabilityService;
	}

	@Override
	public void run(ApplicationArguments args) {
		serviceAvailabilityService.purgeExpiredAvailability();
	}

	@Scheduled(cron = "0 5 0 * * *")
	public void purgeExpiredDaily() {
		serviceAvailabilityService.purgeExpiredAvailability();
		log.debug("Purged expired service availability slots");
	}
}
