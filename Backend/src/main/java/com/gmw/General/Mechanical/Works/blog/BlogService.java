package com.gmw.General.Mechanical.Works.blog;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Service
public class BlogService {

	public static final int MAX_IMAGE_BYTES = 4 * 1024 * 1024;

	private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
			"image/jpeg",
			"image/png",
			"image/webp",
			"image/gif");
	private static final String BLOG_WEB_PREFIX = "/uploads/blogs/";
	private static final Path BLOG_STORAGE_DIR = Path.of("uploads", "blogs");

	private final BlogRepository blogRepository;
	private final BlogLikeRepository blogLikeRepository;
	private final UserRepository userRepository;

	public BlogService(
			BlogRepository blogRepository,
			BlogLikeRepository blogLikeRepository,
			UserRepository userRepository) {
		this.blogRepository = blogRepository;
		this.blogLikeRepository = blogLikeRepository;
		this.userRepository = userRepository;
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
		blog.setImagePath(storeImage(file, null));
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
			blog.setImagePath(storeImage(file, blog.getImagePath()));
		}
		return BlogMapper.toDto(blogRepository.save(blog));
	}

	@Transactional
	public void delete(Long id) {
		Blog blog = blogRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Blog not found"));
		deleteStoredFileIfAny(blog.getImagePath());
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

	private static String extensionFor(String contentType) {
		return switch (contentType) {
			case "image/jpeg" -> ".jpg";
			case "image/png" -> ".png";
			case "image/webp" -> ".webp";
			case "image/gif" -> ".gif";
			default -> throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported file type");
		};
	}

	private static void deleteStoredFileIfAny(String webPath) {
		if (!StringUtils.hasText(webPath)) {
			return;
		}
		if (!webPath.startsWith(BLOG_WEB_PREFIX)) {
			return;
		}
		String fileName = webPath.substring(BLOG_WEB_PREFIX.length());
		if (fileName.isBlank() || fileName.contains("/") || fileName.contains("\\")) {
			return;
		}
		Path filePath = BLOG_STORAGE_DIR.resolve(fileName).normalize();
		if (!filePath.startsWith(BLOG_STORAGE_DIR.normalize())) {
			return;
		}
		try {
			Files.deleteIfExists(filePath);
		} catch (IOException ignored) {
			// Non-fatal cleanup failure.
		}
	}

	private String storeImage(MultipartFile file, String currentWebPath) {
		if (file.getSize() > MAX_IMAGE_BYTES) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image must be 4 MB or smaller");
		}
		String contentType = file.getContentType();
		if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase(Locale.ROOT))) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Use JPEG, PNG, WebP, or GIF");
		}
		deleteStoredFileIfAny(currentWebPath);
		String ext = extensionFor(contentType.toLowerCase(Locale.ROOT));
		String fileName = UUID.randomUUID() + ext;
		Path destination = BLOG_STORAGE_DIR.resolve(fileName);
		try {
			Files.createDirectories(BLOG_STORAGE_DIR);
			try (InputStream in = file.getInputStream()) {
				Files.copy(in, destination, StandardCopyOption.REPLACE_EXISTING);
			}
		} catch (IOException e) {
			throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store file");
		}
		return BLOG_WEB_PREFIX + fileName;
	}
}
