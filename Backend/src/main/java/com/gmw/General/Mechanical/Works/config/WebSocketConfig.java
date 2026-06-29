package com.gmw.General.Mechanical.Works.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

import com.gmw.General.Mechanical.Works.chat.ChatWebSocketHandler;
import com.gmw.General.Mechanical.Works.chat.JwtWebSocketHandshakeInterceptor;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

	private final ChatWebSocketHandler chatWebSocketHandler;
	private final JwtWebSocketHandshakeInterceptor jwtWebSocketHandshakeInterceptor;

	public WebSocketConfig(
			ChatWebSocketHandler chatWebSocketHandler,
			JwtWebSocketHandshakeInterceptor jwtWebSocketHandshakeInterceptor) {
		this.chatWebSocketHandler = chatWebSocketHandler;
		this.jwtWebSocketHandshakeInterceptor = jwtWebSocketHandshakeInterceptor;
	}

	@Override
	public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
		registry.addHandler(chatWebSocketHandler, "/ws/chat")
				.addInterceptors(jwtWebSocketHandshakeInterceptor)
				.setAllowedOriginPatterns("http://localhost:*", "http://127.0.0.1:*");
	}
}
