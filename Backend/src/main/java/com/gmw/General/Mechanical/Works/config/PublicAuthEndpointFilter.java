package com.gmw.General.Mechanical.Works.config;

import java.io.IOException;
import java.util.Set;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Clears any existing JWT authentication before public login/signup/google POST handlers run,
 * so a logged-in user switching Google accounts does not hit {@code denyAll()} as ROLE_USER.
 */
@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class PublicAuthEndpointFilter extends OncePerRequestFilter {

	private static final Set<String> PUBLIC_AUTH_POST_PATHS = Set.of(
			"/api/auth/login",
			"/api/auth/login/verify",
			"/api/auth/login/resend",
			"/api/auth/forgot-password",
			"/api/auth/forgot-password/resend",
			"/api/auth/forgot-password/reset",
			"/api/auth/signup",
			"/api/auth/google");

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		if (!HttpMethod.POST.matches(request.getMethod())) {
			return true;
		}
		return !PUBLIC_AUTH_POST_PATHS.contains(normalizePath(pathWithoutContext(request)));
	}

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		SecurityContextHolder.clearContext();
		filterChain.doFilter(request, response);
	}

	static String normalizePath(String path) {
		if (path == null || path.isEmpty()) {
			return "/";
		}
		if (path.length() > 1 && path.endsWith("/")) {
			return path.substring(0, path.length() - 1);
		}
		return path;
	}

	static String pathWithoutContext(HttpServletRequest request) {
		String uri = request.getRequestURI();
		String ctx = request.getContextPath();
		if (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) {
			return uri.substring(ctx.length());
		}
		return uri;
	}
}
