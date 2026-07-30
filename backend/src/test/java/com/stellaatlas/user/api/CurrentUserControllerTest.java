package com.stellaatlas.user.api;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.oidcLogin;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.stellaatlas.shared.config.TimeConfiguration;
import com.stellaatlas.shared.security.SecurityConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest({AuthenticationController.class, CurrentUserController.class})
@Import({SecurityConfiguration.class, TimeConfiguration.class})
class CurrentUserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void shouldRejectAnonymousCurrentUserRequest() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"))
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."))
                .andExpect(jsonPath("$.path").value("/api/v1/users/me"))
                .andExpect(jsonPath("$.details").isArray());
    }

    @Test
    void shouldReturnAuthenticatedOidcProfile() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .with(oidcLogin().idToken(token -> token
                                .claim("name", "Stella Observer")
                                .claim("email", "observer@example.com")
                                .claim("picture", "https://example.com/profile.png"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Stella Observer"))
                .andExpect(jsonPath("$.email").value("observer@example.com"))
                .andExpect(jsonPath("$.pictureUrl").value("https://example.com/profile.png"));
    }

    @Test
    void shouldKeepObservationForecastPublic() throws Exception {
        mockMvc.perform(get("/api/v1/observations"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldIssueCsrfTokenForBrowserRequests() throws Exception {
        mockMvc.perform(get("/api/v1/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"))
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    void shouldRequireCsrfTokenForLogout() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout").with(oidcLogin()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("FORBIDDEN"));
    }

    @Test
    void shouldLogoutAuthenticatedUser() throws Exception {
        mockMvc.perform(post("/api/v1/auth/logout")
                        .with(oidcLogin())
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }
}
