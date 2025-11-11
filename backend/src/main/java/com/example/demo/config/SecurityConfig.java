package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtDecoders;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Value("${spring.security.oauth2.resourceserver.jwt.issuer-uri}")
    private String issuerUri;

    @Bean
    public JwtDecoder jwtDecoder() {
        // Use the issuer URI as-is (should match Auth0's discovery endpoint exactly)
        return JwtDecoders.fromIssuerLocation(issuerUri);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // Use allowedOriginPatterns to support wildcards (for Cloud Run)
        configuration.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "https://tru-swap.vercel.app",
            "https://tru-swap-git-main-prabeen6260s-projects.vercel.app",
            "https://*.run.app" // Cloud Run URL pattern
        ));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable) // Disable CSRF for API endpoints
            .authorizeHttpRequests(auth -> auth
                // Allow OPTIONS requests for CORS preflight
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public endpoints - no auth required
                .requestMatchers("/api/listings", "/api/listings/**").permitAll()
                .requestMatchers("/api/groups", "/api/groups/{id}").permitAll() // Public group browsing
                // PayPal payment execution - public (called from frontend after PayPal approval)
                .requestMatchers("/api/payments/execute").permitAll()
                // Protected endpoints - require authentication
                .requestMatchers("/api/createListing", "/api/my-listings", "/api/orders", "/api/orders/sold", "/api/payments/create-payment", "/api/groups/my-groups").authenticated()
                .requestMatchers(HttpMethod.POST, "/api/groups").authenticated() // Creating groups requires auth
                .anyRequest().permitAll()
            )
            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwt -> jwt
                    .decoder(jwtDecoder())
                    .jwtAuthenticationConverter(jwtAuthenticationConverter())
                )
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, authException) -> {
                    // Allow CORS headers even for unauthorized requests
                    String origin = request.getHeader("Origin");
                    if (origin != null && (
                        origin.startsWith("http://localhost:") || 
                        origin.equals("https://tru-swap.vercel.app") ||
                        origin.equals("https://tru-swap-git-main-prabeen6260s-projects.vercel.app") ||
                        origin.endsWith(".run.app") // Cloud Run URLs
                    )) {
                        response.setHeader("Access-Control-Allow-Origin", origin);
                    } else {
                        response.setHeader("Access-Control-Allow-Origin", "https://tru-swap.vercel.app");
                    }
                    response.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
                    response.setHeader("Access-Control-Allow-Headers", "*");
                    response.setHeader("Access-Control-Allow-Credentials", "true");
                    response.setContentType("application/json");
                    response.setStatus(401);
                    try {
                        response.getWriter().write("{\"error\":\"Unauthorized\"}");
                    } catch (Exception e) {
                        // Ignore
                    }
                })
            );

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        // You can customize authorities extraction here if needed
        // grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");
        // grantedAuthoritiesConverter.setAuthoritiesClaimName("permissions");

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }
}

