package com.stellaatlas.location.api;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.stellaatlas.location.application.FavoriteLocationService;
import com.stellaatlas.location.domain.FavoriteLocation;
import com.stellaatlas.location.domain.FavoriteLocationNotFoundException;
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
import org.springframework.http.MediaType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(FavoriteLocationController.class)
@Import({FavoriteLocationExceptionHandler.class, SecurityConfiguration.class, TimeConfiguration.class})
class FavoriteLocationControllerTest {

    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID LOCATION_ID = UUID.fromString("30000000-0000-0000-0000-000000000003");
    private static final Instant CREATED_AT = Instant.parse("2026-08-24T04:00:00Z");

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private FavoriteLocationService service;

    @Test
    void shouldRequireAuthenticationForFavoriteLocations() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/locations"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    void shouldCreateFavoriteLocationForCurrentUser() throws Exception {
        when(service.create(
                USER_ID,
                "서울 천문대",
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000")
        )).thenReturn(location(USER_ID));

        mockMvc.perform(post("/api/v1/users/me/locations")
                        .with(authentication(currentUserAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "서울 천문대",
                                  "latitude": 37.566500,
                                  "longitude": 126.978000
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(LOCATION_ID.toString()))
                .andExpect(jsonPath("$.name").value("서울 천문대"))
                .andExpect(jsonPath("$.timezone").value("Asia/Seoul"))
                .andExpect(jsonPath("$.createdAt").value(CREATED_AT.toString()));
    }

    @Test
    void shouldRejectInvalidFavoriteLocation() throws Exception {
        mockMvc.perform(post("/api/v1/users/me/locations")
                        .with(authentication(currentUserAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "",
                                  "latitude": 91,
                                  "longitude": 126.978000
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.details").isArray());
    }

    @Test
    void shouldListOnlyCurrentUsersFavoriteLocations() throws Exception {
        when(service.getAll(USER_ID)).thenReturn(List.of(location(USER_ID)));

        mockMvc.perform(get("/api/v1/users/me/locations")
                        .with(authentication(currentUserAuthentication())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(LOCATION_ID.toString()))
                .andExpect(jsonPath("$[0].name").value("서울 천문대"));

        verify(service).getAll(USER_ID);
    }

    @Test
    void shouldReturnNotFoundWhenLocationIsNotOwnedByCurrentUser() throws Exception {
        when(service.get(USER_ID, LOCATION_ID))
                .thenThrow(new FavoriteLocationNotFoundException(LOCATION_ID));

        mockMvc.perform(get("/api/v1/users/me/locations/{locationId}", LOCATION_ID)
                        .with(authentication(currentUserAuthentication())))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("LOCATION_NOT_FOUND"))
                .andExpect(jsonPath("$.message").value("저장된 관측 위치를 찾을 수 없습니다."));
    }

    @Test
    void shouldDeleteCurrentUsersFavoriteLocation() throws Exception {
        mockMvc.perform(delete("/api/v1/users/me/locations/{locationId}", LOCATION_ID)
                        .with(authentication(currentUserAuthentication()))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(service).delete(USER_ID, LOCATION_ID);
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

    private FavoriteLocation location(UUID userId) {
        return new FavoriteLocation(
                LOCATION_ID,
                userId,
                "서울 천문대",
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000"),
                ZoneId.of("Asia/Seoul"),
                CREATED_AT
        );
    }
}
