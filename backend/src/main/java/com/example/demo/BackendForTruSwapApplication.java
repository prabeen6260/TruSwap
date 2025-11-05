package com.example.demo;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BackendForTruSwapApplication {

	public static void main(String[] args) {
		// Load .env file if it exists (for local development)
		// In production, use actual environment variables
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();
		
		// Set system properties from .env file so Spring Boot can access them
		// Spring Boot will read these via ${VAR_NAME} syntax in application.properties
		dotenv.entries().forEach(entry -> {
			String key = entry.getKey();
			String value = entry.getValue();
			// Set as system property for Spring Boot property resolution
			System.setProperty(key, value);
		});
		
		SpringApplication.run(BackendForTruSwapApplication.class, args);
	}

}
