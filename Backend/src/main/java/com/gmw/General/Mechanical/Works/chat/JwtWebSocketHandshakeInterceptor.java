package com.gmw.General.Mechanical.Works.chat;

import java.net.URI;
import java.util.Map;

import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import com.gmw.General.Mechanical.Works.config.JwtService;
import com.gmw.General.Mechanical.Works.user.Role;
import com.gmw.General.Mechanical.Works.user.User;
import com.gmw.General.Mechanical.Works.user.UserRepository;

@Component
public class JwtWebSocketHandshakeInterceptor implements HandshakeInterceptor {

	private final JwtService jwtService;
	private final UserRepository userRepository;

	public JwtWebSocketHandshakeInterceptor(JwtService jwtService, UserRepository userRepository) {
		this.jwtService = jwtService;
		this.userRepository = userRepository;
	}

	@Override
	public boolean beforeHandshake(
			ServerHttpRequest request,
			ServerHttpResponse response,
			WebSocketHandler wsHandler,
			Map<String, Object> attributes) {
		String token = extractToken(request.getURI());
		if (!StringUtils.hasText(token) || !jwtService.isTokenValid(token)) {
			return false;
		}
		String email = jwtService.extractEmail(token);
		User user = userRepository.findByEmailIgnoreCase(email.trim().toLowerCase()).orElse(null);
		if (user == null) {
			return false;
		}
		attributes.put("userId", user.getId());
		attributes.put("email", user.getEmail());
		attributes.put("admin", user.getRole() == Role.ADMIN);
		return true;
	}

	@Override
	public void afterHandshake(
			ServerHttpRequest request,
			ServerHttpResponse response,
			WebSocketHandler wsHandler,
			Exception exception) {
		/* no-op */
	}

	private static String extractToken(URI uri) {
		if (uri == null || !StringUtils.hasText(uri.getQuery())) {
			return null;
		}
		for (String part : uri.getQuery().split("&")) {
			int eq = part.indexOf('=');
			if (eq <= 0) {
				continue;
			}
			if ("token".equals(part.substring(0, eq))) {
				return java.net.URLDecoder.decode(part.substring(eq + 1), java.nio.charset.StandardCharsets.UTF_8);
			}
		}
		return null;
	}
}
