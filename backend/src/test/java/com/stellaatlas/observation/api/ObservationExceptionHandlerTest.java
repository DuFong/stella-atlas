package com.stellaatlas.observation.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.stellaatlas.observation.domain.ObservationDataUnavailableException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import org.junit.jupiter.api.Test;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

class ObservationExceptionHandlerTest {

    private static final Instant FIXED_TIME = Instant.parse("2026-08-01T10:00:00Z");

    @Test
    void shouldHideInternalDetailsWhenObservationDataIsUnavailable() throws Exception {
        MockMvc mockMvc = MockMvcBuilders.standaloneSetup(new FailureController())
                .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper()))
                .setControllerAdvice(new ObservationExceptionHandler(
                        Clock.fixed(FIXED_TIME, ZoneOffset.UTC)
                ))
                .build();

        mockMvc.perform(get("/test/observation-failure"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("OBSERVATION_DATA_UNAVAILABLE"))
                .andExpect(jsonPath("$.message")
                        .value("관측 조건을 계산하는 데 필요한 정보가 부족합니다."))
                .andExpect(jsonPath("$.timestamp").value(FIXED_TIME.toString()))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    private ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @RestController
    static class FailureController {

        @GetMapping("/test/observation-failure")
        void fail() {
            throw new ObservationDataUnavailableException(
                    "internal timezone mismatch details"
            );
        }
    }
}
