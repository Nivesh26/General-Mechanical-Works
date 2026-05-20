package com.gmw.General.Mechanical.Works.blog;

import java.util.List;

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
	public BlogDto get(@PathVariable Long id) {
		return blogService.getById(id);
	}

	@PostMapping("/{id}/like")
	public BlogDto like(@PathVariable Long id) {
		return blogService.incrementLike(id);
	}
}
