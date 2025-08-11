package com.project.backend.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.project.backend.security.JwtAuthenticationFilter;

@Configuration
public class SecurityConfig {
    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())  // disable CSRF
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))  // prevents Spring from creating sessions
            .authorizeHttpRequests(auth -> auth  // define authorisation rules
                .requestMatchers(    // allowed APIs for public access
                    "/api/login", 
                    "/api/register", 
                    "/api/reset-password", 
                    "/api/update-password"
                ).permitAll()
                .anyRequest().authenticated()   // require authentication for all other request
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
            
        return http.build();
    }
}
