package com.stellaatlas.observation.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.stellaatlas.location.application.RecentLocationService;
import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.LunarEvents;
import com.stellaatlas.astronomy.domain.LunarVisibility;
import com.stellaatlas.astronomy.domain.SolarEvents;
import com.stellaatlas.observation.application.ObservationForecastService;
import com.stellaatlas.observation.domain.ObservationEvaluation;
import com.stellaatlas.observation.domain.ObservationForecast;
import com.stellaatlas.observation.domain.ObservationGrade;
import com.stellaatlas.observation.domain.ObservationHour;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationWindow;
import com.stellaatlas.observation.domain.TwilightPhase;
import com.stellaatlas.weather.domain.HourlyWeatherCondition;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.security.web.method.annotation.AuthenticationPrincipalArgumentResolver;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ObservationControllerTest {

    private static final Instant GENERATED_AT = Instant.parse("2026-08-01T10:00:00Z");
    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    @Test
    void shouldReturnComposedObservationForecast() throws Exception {
        ObservationForecastService service = mock(ObservationForecastService.class);
        when(service.getForecast(any())).thenReturn(forecast());
        ObservationController controller = new ObservationController(
                service,
                new ObservationResponseMapper(Clock.fixed(GENERATED_AT, ZoneOffset.UTC)),
                mock(RecentLocationService.class)
        );
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setCustomArgumentResolvers(new AuthenticationPrincipalArgumentResolver())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper()))
                .build();

        mockMvc.perform(get("/api/v1/observations")
                        .param("latitude", "37.5665")
                        .param("longitude", "126.978")
                        .param("date", "2026-08-01"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.location.timezone").value("Asia/Seoul"))
                .andExpect(jsonPath("$.date").value("2026-08-01"))
                .andExpect(jsonPath("$.summary.score").value(90))
                .andExpect(jsonPath("$.summary.grade").value("EXCELLENT"))
                .andExpect(jsonPath("$.summary.recommended").value(true))
                .andExpect(jsonPath("$.summary.bestWindow.averageScore").value(90))
                .andExpect(jsonPath("$.astronomy.sunset.state").value("OCCURS"))
                .andExpect(jsonPath("$.astronomy.moonIllumination").value(0.2))
                .andExpect(jsonPath("$.hourly[0].twilightPhase").value("DARK"))
                .andExpect(jsonPath("$.hourly[0].reasons[0].code")
                        .value("MODERATE_CLOUD_COVER"))
                .andExpect(jsonPath("$.generatedAt").value(GENERATED_AT.toString()));
    }

    @Test
    void shouldRecordRecentLocationOnlyWithExplicitConsentAndAuthenticatedUser() {
        ObservationForecastService service = mock(ObservationForecastService.class);
        when(service.getForecast(any())).thenReturn(forecast());
        RecentLocationService recentLocations = mock(RecentLocationService.class);
        ObservationController controller = new ObservationController(
                service,
                new ObservationResponseMapper(Clock.fixed(GENERATED_AT, ZoneOffset.UTC)),
                recentLocations
        );
        com.stellaatlas.user.application.AuthenticatedUser user =
                () -> UUID.fromString("10000000-0000-0000-0000-000000000001");

        controller.getForecast(37.5665, 126.978, LocalDate.of(2026, 8, 1), true, user);
        controller.getForecast(35.1796, 129.0756, LocalDate.of(2026, 8, 1), false, user);

        verify(recentLocations).record(
                user.userId(),
                37.5665,
                126.978,
                SEOUL
        );
        verify(recentLocations, never()).record(
                user.userId(),
                35.1796,
                129.0756,
                SEOUL
        );
    }

    private ObservationForecast forecast() {
        Instant observedAt = Instant.parse("2026-08-01T12:00:00Z");
        ObservationEvaluation evaluation = new ObservationEvaluation(
                90,
                ObservationGrade.EXCELLENT,
                true,
                List.of(new ObservationReason(
                        ObservationReasonCode.MODERATE_CLOUD_COVER,
                        -10,
                        "구름이 조금 예상됩니다."
                ))
        );
        HorizonEvent event = HorizonEvent.occursAt(observedAt);
        AstronomyConditions astronomy = new AstronomyConditions(
                SEOUL,
                new SolarEvents(event, event, event, event, event, event, event, event),
                new LunarEvents(
                        Optional.empty(),
                        Optional.empty(),
                        LunarVisibility.ALWAYS_BELOW,
                        0.1,
                        0.2
                )
        );
        ObservationHour hour = new ObservationHour(
                new HourlyWeatherCondition(
                        observedAt,
                        20,
                        30,
                        0,
                        50,
                        20_000,
                        1
                ),
                TwilightPhase.DARK,
                false,
                evaluation
        );
        return new ObservationForecast(
                37.5665,
                126.978,
                LocalDate.of(2026, 8, 1),
                SEOUL,
                astronomy,
                List.of(hour),
                evaluation,
                Optional.of(new ObservationWindow(
                        observedAt,
                        observedAt.plusSeconds(3_600),
                        90
                ))
        );
    }

    private ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }
}
