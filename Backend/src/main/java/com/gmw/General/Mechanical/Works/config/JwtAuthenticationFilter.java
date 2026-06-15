package com.gmw.General.Mechanical.Works.config;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

	private final JwtService jwtService;

	public JwtAuthenticationFilter(JwtService jwtService) {
		this.jwtService = jwtService;
	}

	/**
	 * Do not run JWT parsing on public auth endpoints — avoids any interaction with
	 * anonymous auth / matcher ordering that can surface as 403 on login.
	 */
	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = PublicAuthEndpointFilter.normalizePath(PublicAuthEndpointFilter.pathWithoutContext(request));
		if (path.startsWith("/uploads/")) {
			return true;
		}
		if (!"POST".equalsIgnoreCase(request.getMethod())) {
			return false;
		}
		return "/api/auth/login".equals(path)
				|| "/api/auth/signup".equals(path)
				|| "/api/auth/google".equals(path);
	}

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		String token = null;
		if (header != null && header.startsWith("Bearer ")) {
			token = header.substring(7);
		} else if (isEsewaLaunchRequest(request)) {
			token = request.getParameter("access_token");
		}

		if (token != null && jwtService.isTokenValid(token)) {
			String email = jwtService.extractEmail(token);
			String role = jwtService.extractRole(token);
			String authority = "ROLE_" + role;
			UsernamePasswordAuthenticationToken authentication =
					new UsernamePasswordAuthenticationToken(
							email,
							null,
							List.of(new SimpleGrantedAuthority(authority)));
			authentication.setDetails(token);
			SecurityContextHolder.getContext().setAuthentication(authentication);
		}
		filterChain.doFilter(request, response);
	}

	private static boolean isEsewaLaunchRequest(HttpServletRequest request) {
		if (!"GET".equalsIgnoreCase(request.getMethod())) {
			return false;
		}
		String path = PublicAuthEndpointFilter.normalizePath(
				PublicAuthEndpointFilter.pathWithoutContext(request));
		return path.startsWith("/api/payments/esewa/launch/");
	}
}
