package com.stellaatlas.weather.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.stellaatlas.weather.domain.WeatherProviderResponseException;
import com.stellaatlas.weather.domain.WeatherProviderUnavailableException;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class WeatherExceptionHandlerTest {

    private static final Instant FIXED_TIME =
            Instant.parse("2026-07-29T00:00:00Z");

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new WeatherFailureTestController())
            .setMessageConverters(new MappingJackson2HttpMessageConverter(
                    objectMapper()
            ))
            .setControllerAdvice(new WeatherExceptionHandler(
                    Clock.fixed(FIXED_TIME, ZoneOffset.UTC)
            ))
            .build();

    @Test
    void shouldReturnServiceUnavailableWithoutExposingProviderDetails()
            throws Exception {
        mockMvc.perform(get("/test/weather/unavailable"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("WEATHER_PROVIDER_UNAVAILABLE"))
                .andExpect(jsonPath("$.message")
                        .value("날씨 정보를 일시적으로 불러올 수 없습니다."))
                .andExpect(jsonPath("$.timestamp").value(FIXED_TIME.toString()))
                .andExpect(jsonPath("$.path").value("/test/weather/unavailable"))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void shouldReturnBadGatewayWhenProviderResponseIsInvalid() throws Exception {
        mockMvc.perform(get("/test/weather/invalid-response"))
                .andExpect(status().isBadGateway())
                .andExpect(jsonPath("$.code").value("EXTERNAL_PROVIDER_ERROR"))
                .andExpect(jsonPath("$.message")
                        .value("날씨 공급자의 응답을 처리할 수 없습니다."))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    private static ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @RestController
    @RequestMapping("/test/weather")
    static class WeatherFailureTestController {

        @GetMapping("/unavailable")
        void unavailable() {
            throw new WeatherProviderUnavailableException(
                    "provider timeout with internal details",
                    new RuntimeException("socket timeout")
            );
        }

        @GetMapping("/invalid-response")
        void invalidResponse() {
            throw new WeatherProviderResponseException(
                    "provider returned an invalid payload"
            );
        }
    }
}
