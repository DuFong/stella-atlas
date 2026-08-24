package com.stellaatlas.location.api;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.stellaatlas.location.application.RecentLocationService;
import com.stellaatlas.location.domain.RecentLocation;
import com.stellaatlas.shared.config.TimeConfiguration;
import com.stellaatlas.shared.security.SecurityConfiguration;
import com.stellaatlas.user.infrastructure.AuthenticatedOidcUser;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(RecentLocationController.class)
@Import({SecurityConfiguration.class, TimeConfiguration.class})
class RecentLocationControllerTest {

    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RecentLocationService service;

    @Test
    void shouldListOnlyCurrentUsersRecentLocations() throws Exception {
        when(service.getAll(USER_ID)).thenReturn(List.of(new RecentLocation(
                UUID.randomUUID(),
                USER_ID,
                new BigDecimal("37.5665"),
                new BigDecimal("126.9780"),
                ZoneId.of("Asia/Seoul"),
                Instant.parse("2026-08-24T05:00:00Z")
        )));

        mockMvc.perform(get("/api/v1/users/me/recent-locations")
                        .with(authentication(currentUserAuthentication())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].latitude").value(37.5665))
                .andExpect(jsonPath("$[0].timezone").value("Asia/Seoul"));

        verify(service).getAll(USER_ID);
    }

    @Test
    void shouldClearCurrentUsersRecentLocationsWithCsrf() throws Exception {
        mockMvc.perform(delete("/api/v1/users/me/recent-locations")
                        .with(authentication(currentUserAuthentication()))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(service).clear(USER_ID);
    }

    private OAuth2AuthenticationToken currentUserAuthentication() {
        AuthenticatedOidcUser principal = mock(AuthenticatedOidcUser.class);
        when(principal.userId()).thenReturn(USER_ID);
        return new OAuth2AuthenticationToken(
                principal,
                List.of(new SimpleGrantedAuthority("OIDC_USER")),
                "google"
        );
    }
}
