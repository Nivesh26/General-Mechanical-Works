package com.gmw.General.Mechanical.Works.auth;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class GlobalExceptionHandler {

	private static final String DUPLICATE_EMAIL_MESSAGE =
			"This email is already registered. Please sign in, use Google sign-in if you created the account that way, or choose a different email.";

	@ExceptionHandler(EmailAlreadyRegisteredException.class)
	public ResponseEntity<ErrorBody> handleDuplicateEmail(EmailAlreadyRegisteredException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(DUPLICATE_EMAIL_MESSAGE));
	}

	@ExceptionHandler(DataIntegrityViolationException.class)
	public ResponseEntity<ErrorBody> handleDataIntegrity(DataIntegrityViolationException ex) {
		return ResponseEntity.status(HttpStatus.CONFLICT).body(new ErrorBody(resolveIntegrityMessage(ex)));
	}

	private static String resolveIntegrityMessage(DataIntegrityViolationException ex) {
		if (isDuplicateEmailViolation(ex)) {
			return DUPLICATE_EMAIL_MESSAGE;
		}
		String lower = rootMessage(ex).toLowerCase();
		if (lower.contains("data too long") || lower.contains("data truncation")) {
			if (lower.contains("description")) {
				return "Product description is too long. Please shorten it and try again.";
			}
			if (lower.contains("sku")) {
				return "This SKU is already in use. Choose a different SKU.";
			}
			return "One or more product fields are too long. Please shorten the text and try again.";
		}
		if (lower.contains("duplicate") && lower.contains("sku")) {
			return "This SKU is already in use. Choose a different SKU.";
		}
		if (lower.contains("duplicate entry") && lower.contains("product")) {
			return "This SKU is already in use. Choose a different SKU.";
		}
		if (lower.contains("duplicate entry")) {
			return "This value is already in use. Please change it and try again.";
		}
		return "Could not save. Please check your data and try again.";
	}

	private static String rootMessage(Throwable ex) {
		Throwable root = ex;
		while (root.getCause() != null) {
			root = root.getCause();
		}
		return root.getMessage() != null ? root.getMessage() : "";
	}

	private static boolean isDuplicateEmailViolation(Throwable ex) {
		String lower = rootMessage(ex).toLowerCase();
		if (!lower.contains("duplicate") && !lower.contains("unique")) {
			return false;
		}
		if (lower.contains("email") || lower.contains("duplicate entry") && lower.contains("@")) {
			return true;
		}
		return lower.contains("`user`") || lower.contains(" for key") && lower.contains("user.");
	}

	@ExceptionHandler(AccessDeniedException.class)
	public ResponseEntity<ErrorBody> handleAccessDenied(AccessDeniedException ex) {
		return ResponseEntity.status(HttpStatus.FORBIDDEN)
				.body(new ErrorBody("Access denied"));
	}

	@ExceptionHandler(BadCredentialsException.class)
	public ResponseEntity<ErrorBody> handleBadCredentials(BadCredentialsException ex) {
		return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorBody("Invalid email or password"));
	}

	@ExceptionHandler(MethodArgumentNotValidException.class)
	public ResponseEntity<ErrorBody> handleValidation(MethodArgumentNotValidException ex) {
		String msg = ex.getBindingResult().getFieldErrors().stream()
				.findFirst()
				.map(err -> err.getField() + ": " + err.getDefaultMessage())
				.orElse("Validation failed");
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorBody(msg));
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	public ResponseEntity<ErrorBody> handleMaxUpload(MaxUploadSizeExceededException ex) {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorBody("File is too large"));
	}

	@ExceptionHandler(ResponseStatusException.class)
	public ResponseEntity<ErrorBody> handleResponseStatus(ResponseStatusException ex) {
		String reason = ex.getReason();
		String msg = (reason != null && !reason.isBlank()) ? reason : "Request failed";
		return ResponseEntity.status(ex.getStatusCode()).body(new ErrorBody(msg));
	}

	public record ErrorBody(String message) {
	}
}
