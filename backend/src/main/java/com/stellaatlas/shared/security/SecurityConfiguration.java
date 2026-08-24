package com.stellaatlas.shared.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stellaatlas.shared.error.ApiErrorResponse;
import com.stellaatlas.user.infrastructure.GoogleOidcUserService;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfiguration {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            ObjectProvider<ClientRegistrationRepository> registrations,
            ObjectProvider<GoogleOidcUserService> oidcUserServices,
            ObjectMapper objectMapper,
            Clock clock,
            @Value("${stellaatlas.security.frontend-base-url:http://localhost:3000}")
            String frontendBaseUrl
    ) throws Exception {
        http
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(HttpMethod.GET, "/actuator/health", "/actuator/info").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/observations").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/auth/csrf").permitAll()
                        .requestMatchers("/oauth2/**", "/login/**", "/error").permitAll()
                        .requestMatchers("/api/v1/users/me/**").authenticated()
                        .anyRequest().denyAll())
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, exception) ->
                                writeError(
                                        response,
                                        objectMapper,
                                        new ApiErrorResponse(
                                                "UNAUTHORIZED",
                                                "로그인이 필요합니다.",
                                                Instant.now(clock),
                                                request.getRequestURI(),
                                                List.of()
                                        ),
                                        HttpServletResponse.SC_UNAUTHORIZED
                                ))
                        .accessDeniedHandler((request, response, exception) ->
                                writeError(
                                        response,
                                        objectMapper,
                                        new ApiErrorResponse(
                                                "FORBIDDEN",
                                                "이 리소스에 접근할 권한이 없습니다.",
                                                Instant.now(clock),
                                                request.getRequestURI(),
                                                List.of()
                                        ),
                                        HttpServletResponse.SC_FORBIDDEN
                                )))
                .logout(logout -> logout
                        .logoutUrl("/api/v1/auth/logout")
                        .deleteCookies("JSESSIONID")
                        .logoutSuccessHandler((request, response, authentication) ->
                                response.setStatus(HttpServletResponse.SC_NO_CONTENT)));

        if (registrations.getIfAvailable() != null) {
            GoogleOidcUserService oidcUserService = oidcUserServices.getIfAvailable();
            http.oauth2Login(login -> {
                login.defaultSuccessUrl(frontendBaseUrl, true);
                if (oidcUserService != null) {
                    login.userInfoEndpoint(userInfo -> userInfo.oidcUserService(oidcUserService::loadUser));
                }
            });
        }

        return http.build();
    }

    private static void writeError(
            HttpServletResponse response,
            ObjectMapper objectMapper,
            ApiErrorResponse error,
            int status
    ) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), error);
    }
}
