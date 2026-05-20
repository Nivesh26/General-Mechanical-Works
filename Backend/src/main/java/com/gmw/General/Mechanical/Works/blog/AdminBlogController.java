package com.gmw.General.Mechanical.Works.blog;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/blogs")
public class AdminBlogController {

	private final BlogService blogService;

	public AdminBlogController(BlogService blogService) {
		this.blogService = blogService;
	}

	@GetMapping
	public List<BlogDto> list() {
		return blogService.listAllForAdmin();
	}

	@PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public BlogDto create(
			@RequestParam String title,
			@RequestParam String dateLabel,
			@RequestParam String body,
			@RequestPart("file") MultipartFile file) {
		return blogService.create(title, dateLabel, body, file);
	}

	@PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
	public BlogDto update(
			@PathVariable Long id,
			@RequestParam String title,
			@RequestParam String dateLabel,
			@RequestParam String body,
			@RequestPart(value = "file", required = false) MultipartFile file) {
		return blogService.update(id, title, dateLabel, body, file);
	}

	@DeleteMapping("/{id}")
	public void delete(@PathVariable Long id) {
		blogService.delete(id);
	}
}
