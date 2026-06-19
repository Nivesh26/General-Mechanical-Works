package com.gmw.General.Mechanical.Works.blog;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.storage.ImageStorageService;
import com.gmw.General.Mechanical.Works.storage.ImageStorageService.Folder;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class BlogService {

	public static final int MAX_IMAGE_BYTES = 4 * 1024 * 1024;

	private final BlogRepository blogRepository;
	private final BlogLikeRepository blogLikeRepository;
	private final UserRepository userRepository;
	private final ImageStorageService imageStorageService;

	public BlogService(
			BlogRepository blogRepository,
			BlogLikeRepository blogLikeRepository,
			UserRepository userRepository,
			ImageStorageService imageStorageService) {
		this.blogRepository = blogRepository;
		this.blogLikeRepository = blogLikeRepository;
		this.userRepository = userRepository;
		this.imageStorageService = imageStorageService;
	}

	@Transactional(readOnly = true)
	public List<BlogSummaryDto> listSummaries() {
		return blogRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(BlogMapper::toSummary)
				.toList();
	}

	@Transactional(readOnly = true)
	public BlogDto getById(Long id, String userEmail) {
		Blog blog = blogRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));
		Long userId = resolveUserId(userEmail);
		boolean liked = userId != null && blogLikeRepository.existsByBlogIdAndUserId(id, userId);
		return BlogMapper.toDto(blog, liked);
	}

	@Transactional(readOnly = true)
	public List<BlogDto> listAllForAdmin() {
		return blogRepository.findAllByOrderByCreatedAtDesc().stream()
				.map(BlogMapper::toDto)
				.toList();
	}

	@Transactional
	public BlogDto create(String title, String dateLabel, String body, MultipartFile file) {
		requireImage(file);
		validateText(title, dateLabel, body);
		Blog blog = new Blog();
		blog.setTitle(title.trim());
		blog.setDateLabel(dateLabel.trim());
		blog.setBody(body.trim());
		blog.setImagePath(imageStorageService.upload(file, Folder.BLOGS, MAX_IMAGE_BYTES));
		blog.setLikeCount(0);
		blog.setCreatedAt(LocalDateTime.now());
		return BlogMapper.toDto(blogRepository.save(blog));
	}

	@Transactional
	public BlogDto update(Long id, String title, String dateLabel, String body, MultipartFile file) {
		Blog blog = blogRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));
		validateText(title, dateLabel, body);
		blog.setTitle(title.trim());
		blog.setDateLabel(dateLabel.trim());
		blog.setBody(body.trim());
		if (file != null && !file.isEmpty()) {
			imageStorageService.deleteIfStored(blog.getImagePath());
			blog.setImagePath(imageStorageService.upload(file, Folder.BLOGS, MAX_IMAGE_BYTES));
		}
		return BlogMapper.toDto(blogRepository.save(blog));
	}

	@Transactional
	public void delete(Long id) {
		Blog blog = blogRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));
		imageStorageService.deleteIfStored(blog.getImagePath());
		blogRepository.delete(blog);
	}

	@Transactional
	public BlogDto like(Long id, String userEmail) {
		Long userId = resolveUserId(userEmail);
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
		}
		Blog blog = blogRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));
		if (blogLikeRepository.existsByBlogIdAndUserId(id, userId)) {
			return BlogMapper.toDto(blog, true);
		}
		BlogLike like = new BlogLike();
		like.setBlogId(id);
		like.setUserId(userId);
		like.setCreatedAt(LocalDateTime.now());
		blogLikeRepository.save(like);
		blog.setLikeCount(blog.getLikeCount() + 1);
		return BlogMapper.toDto(blogRepository.save(blog), true);
	}

	@Transactional
	public BlogDto unlike(Long id, String userEmail) {
		Long userId = resolveUserId(userEmail);
		if (userId == null) {
			throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required");
		}
		Blog blog = blogRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));
		if (!blogLikeRepository.existsByBlogIdAndUserId(id, userId)) {
			return BlogMapper.toDto(blog, false);
		}
		blogLikeRepository.deleteByBlogIdAndUserId(id, userId);
		blog.setLikeCount(Math.max(0, blog.getLikeCount() - 1));
		return BlogMapper.toDto(blogRepository.save(blog), false);
	}

	private Long resolveUserId(String userEmail) {
		if (!StringUtils.hasText(userEmail)) {
			return null;
		}
		return userRepository.findByEmailIgnoreCase(userEmail.trim().toLowerCase())
				.map(User::getId)
				.orElse(null);
	}

	private static void validateText(String title, String dateLabel, String body) {
		if (!StringUtils.hasText(title) || !StringUtils.hasText(dateLabel) || !StringUtils.hasText(body)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Title, date, and content are required");
		}
	}

	private static void requireImage(MultipartFile file) {
		if (file == null || file.isEmpty()) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cover image is required");
		}
	}
}
