package com.stellaatlas.record.api;

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

import com.stellaatlas.record.application.ObservationRecordService;
import com.stellaatlas.record.domain.ObservationRecord;
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

@WebMvcTest(ObservationRecordController.class)
@Import({ObservationRecordExceptionHandler.class, SecurityConfiguration.class, TimeConfiguration.class})
class ObservationRecordControllerTest {

    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID RECORD_ID = UUID.fromString("40000000-0000-0000-0000-000000000004");

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ObservationRecordService service;

    @Test
    void shouldRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/users/me/records"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldCreateMetadataOnlyRecordForCurrentUser() throws Exception {
        when(service.create(
                USER_ID,
                Instant.parse("2026-08-24T12:00:00Z"),
                ZoneId.of("Asia/Seoul"),
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000"),
                "맑은 하늘 #서울"
        )).thenReturn(record(USER_ID));

        mockMvc.perform(post("/api/v1/users/me/records")
                        .with(authentication(currentUserAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "observedAt": "2026-08-24T12:00:00Z",
                                  "timezone": "Asia/Seoul",
                                  "latitude": 37.566500,
                                  "longitude": 126.978000,
                                  "comment": "맑은 하늘 #서울"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(RECORD_ID.toString()))
                .andExpect(jsonPath("$.hashtags[0]").value("서울"))
                .andExpect(jsonPath("$.mediaStatus").value("NOT_ATTACHED"));
    }

    @Test
    void shouldRejectInvalidCoordinatePairAndTimezone() throws Exception {
        mockMvc.perform(post("/api/v1/users/me/records")
                        .with(authentication(currentUserAuthentication()))
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "observedAt": "2026-08-24T12:00:00Z",
                                  "timezone": "Invalid/Zone",
                                  "latitude": 37.5,
                                  "comment": "관측"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"));
    }

    @Test
    void shouldListAndDeleteOnlyThroughCurrentUserScope() throws Exception {
        when(service.getAll(USER_ID)).thenReturn(List.of(record(USER_ID)));

        mockMvc.perform(get("/api/v1/users/me/records")
                        .with(authentication(currentUserAuthentication())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(RECORD_ID.toString()));

        mockMvc.perform(delete("/api/v1/users/me/records/{recordId}", RECORD_ID)
                        .with(authentication(currentUserAuthentication()))
                        .with(csrf()))
                .andExpect(status().isNoContent());

        verify(service).getAll(USER_ID);
        verify(service).delete(USER_ID, RECORD_ID);
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

    private ObservationRecord record(UUID userId) {
        return new ObservationRecord(
                RECORD_ID,
                userId,
                Instant.parse("2026-08-24T12:00:00Z"),
                ZoneId.of("Asia/Seoul"),
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000"),
                "맑은 하늘 #서울",
                Instant.parse("2026-08-24T13:00:00Z")
        );
    }
}
