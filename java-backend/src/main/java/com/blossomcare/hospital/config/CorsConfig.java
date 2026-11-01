package com.blossomcare.hospital.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configures Cross-Origin Resource Sharing (CORS) so the React + TypeScript
 * frontend can safely communicate with the Spring Boot REST API during local
 * development and academic demonstrations.
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOriginPatterns(
                        "http://localhost:*",
                        "https://blossom-care-hospital.netlify.app",
                        "https://*.run.app"
                )
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
