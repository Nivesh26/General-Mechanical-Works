package com.gmw.General.Mechanical.Works.offer;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/offers")
public class AdminOfferController {

	private final OfferService offerService;

	public AdminOfferController(OfferService offerService) {
		this.offerService = offerService;
	}

	@GetMapping
	public List<OfferDto> list() {
		return offerService.listAll();
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public OfferDto create(
			@RequestParam String description,
			@RequestPart("file") MultipartFile file) {
		return offerService.create(description, file);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		offerService.delete(id);
	}
}
