package com.gmw.General.Mechanical.Works.blog;

import java.security.Principal;
import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

	private final BlogService blogService;

	public BlogController(BlogService blogService) {
		this.blogService = blogService;
	}

	@GetMapping
	public List<BlogSummaryDto> list() {
		return blogService.listSummaries();
	}

	@GetMapping("/{id}")
	public BlogDto get(@PathVariable Long id, Principal principal) {
		String email = principal != null ? principal.getName() : null;
		return blogService.getById(id, email);
	}

	@PostMapping("/{id}/like")
	public BlogDto like(@PathVariable Long id, Principal principal) {
		String email = principal != null ? principal.getName() : null;
		return blogService.like(id, email);
	}

	@DeleteMapping("/{id}/like")
	public BlogDto unlike(@PathVariable Long id, Principal principal) {
		String email = principal != null ? principal.getName() : null;
		return blogService.unlike(id, email);
	}
}
