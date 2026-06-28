package com.gmw.General.Mechanical.Works.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	@Order(Ordered.HIGHEST_PRECEDENCE)
	public SecurityFilterChain securityFilterChain(
			HttpSecurity http,
			JwtAuthenticationFilter jwtAuthenticationFilter,
			PublicAuthEndpointFilter publicAuthEndpointFilter)
			throws Exception {
		http
				.cors(Customizer.withDefaults())
				.csrf(AbstractHttpConfigurer::disable)
				.sessionManagement(session ->
						session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
				.authorizeHttpRequests(auth -> auth
						.requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
						.requestMatchers("/uploads/**").permitAll()
						.requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
						.requestMatchers("/api/auth/login", "/api/auth/signup", "/api/auth/google").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/login", "/api/auth/signup", "/api/auth/google")
						.permitAll()
						.requestMatchers(HttpMethod.POST, "/api/auth/login/verify", "/api/auth/login/resend")
						.permitAll()
						.requestMatchers(HttpMethod.POST,
								"/api/auth/forgot-password",
								"/api/auth/forgot-password/resend",
								"/api/auth/forgot-password/reset")
						.permitAll()
						.requestMatchers(HttpMethod.POST, "/api/contact").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/auth/me/password").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/auth/me/avatar").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/auth/me/cover-photo").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/auth/me/avatar").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/auth/me/cover-photo").authenticated()
						.requestMatchers(HttpMethod.PATCH, "/api/users/me").authenticated()
						.requestMatchers("/api/vehicles/me", "/api/vehicles/me/**").authenticated()
						.requestMatchers("/api/cart/me", "/api/cart/me/**").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/orders/me").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/orders/me").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/payments/esewa/init").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/payments/esewa/launch/*").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/payments/khalti/init").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/orders/me/*/lines/*/cancel").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/payments/esewa/success").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/payments/esewa/failure").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/payments/khalti/return").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/blogs", "/api/blogs/*").permitAll()
						.requestMatchers(HttpMethod.POST, "/api/blogs/*/like").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/blogs/*/like").authenticated()
						.requestMatchers(HttpMethod.GET, "/api/offers").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/products", "/api/products/*").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/products/*/reviews").permitAll()
						.requestMatchers(HttpMethod.GET, "/api/products/*/reviews/eligibility").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/products/*/reviews").authenticated()
						.requestMatchers(HttpMethod.POST, "/api/reviews/*/like").authenticated()
						.requestMatchers(HttpMethod.DELETE, "/api/reviews/*/like").authenticated()
						.requestMatchers("/api/admin/reviews", "/api/admin/reviews/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/admin/users", "/api/admin/users/**").hasRole("ADMIN")
						.requestMatchers("/api/admin/orders", "/api/admin/orders/**").hasRole("ADMIN")
						.requestMatchers("/api/admin/blogs", "/api/admin/blogs/**").hasRole("ADMIN")
						.requestMatchers("/api/admin/offers", "/api/admin/offers/**").hasRole("ADMIN")
						.requestMatchers("/api/admin/products", "/api/admin/products/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/service-availability").permitAll()
						.requestMatchers("/api/admin/service-availability", "/api/admin/service-availability/**")
						.hasRole("ADMIN")
						.requestMatchers("/api/appointments/me", "/api/appointments/me/**").authenticated()
						.requestMatchers("/api/admin/appointments", "/api/admin/appointments/**").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/admin/dashboard").hasRole("ADMIN")
						.requestMatchers(HttpMethod.GET, "/api/admin/notifications").hasRole("ADMIN")
						.anyRequest().denyAll())
				.addFilterBefore(jwtAuthenticationFilter, AnonymousAuthenticationFilter.class)
				.addFilterBefore(publicAuthEndpointFilter, AnonymousAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration config = new CorsConfiguration();
		config.setAllowedOriginPatterns(List.of("http://localhost:*", "http://127.0.0.1:*"));
		config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
		config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
		config.setExposedHeaders(List.of("Authorization"));
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", config);
		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder(4);
	}
}
