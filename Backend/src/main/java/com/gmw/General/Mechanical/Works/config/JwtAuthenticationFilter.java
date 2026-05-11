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
		String path = pathWithoutContext(request);
		if (path.startsWith("/uploads/")) {
			return true;
		}
		if (!"POST".equals(request.getMethod())) {
			return false;
		}
		return "/api/auth/login".equals(path) || "/api/auth/signup".equals(path);
	}

	private static String pathWithoutContext(HttpServletRequest request) {
		String uri = request.getRequestURI();
		String ctx = request.getContextPath();
		if (ctx != null && !ctx.isEmpty() && uri.startsWith(ctx)) {
			return uri.substring(ctx.length());
		}
		return uri;
	}

	@Override
	protected void doFilterInternal(
			@NonNull HttpServletRequest request,
			@NonNull HttpServletResponse response,
			@NonNull FilterChain filterChain) throws ServletException, IOException {
		String header = request.getHeader(HttpHeaders.AUTHORIZATION);
		if (header != null && header.startsWith("Bearer ")) {
			String token = header.substring(7);
			if (jwtService.isTokenValid(token)) {
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
		}
		filterChain.doFilter(request, response);
	}
}
