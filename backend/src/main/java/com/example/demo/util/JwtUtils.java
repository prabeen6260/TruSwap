package com.example.demo.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Utility class to extract user information from JWT tokens
 */
public class JwtUtils {

    /**
     * Extract user ID (sub claim) from JWT token
     */
    public static String getUserId(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtToken = (JwtAuthenticationToken) authentication;
            Jwt jwt = jwtToken.getToken();
            // Auth0 uses 'sub' claim for user identifier
            return jwt.getClaimAsString("sub");
        }
        return null;
    }

    /**
     * Extract email from JWT token
     */
    public static String getEmail(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtToken = (JwtAuthenticationToken) authentication;
            Jwt jwt = jwtToken.getToken();
            return jwt.getClaimAsString("email");
        }
        return null;
    }

    /**
     * Extract name from JWT token
     */
    public static String getName(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtToken = (JwtAuthenticationToken) authentication;
            Jwt jwt = jwtToken.getToken();
            return jwt.getClaimAsString("name");
        }
        return null;
    }

    /**
     * Get the full JWT token
     */
    public static Jwt getJwt(Authentication authentication) {
        if (authentication instanceof JwtAuthenticationToken) {
            JwtAuthenticationToken jwtToken = (JwtAuthenticationToken) authentication;
            return jwtToken.getToken();
        }
        return null;
    }
}

