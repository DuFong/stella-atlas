package com.stellaatlas.shared.error;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class GlobalExceptionHandlerTest {

    private static final Instant FIXED_TIME = Instant.parse("2026-07-28T00:00:00Z");

    private final MockMvc mockMvc = MockMvcBuilders
            .standaloneSetup(new ValidationTestController())
            .setMessageConverters(new MappingJackson2HttpMessageConverter(objectMapper()))
            .setControllerAdvice(new GlobalExceptionHandler(
                    Clock.fixed(FIXED_TIME, ZoneOffset.UTC)
            ))
            .build();

    private static ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Test
    void shouldReturnConsistentErrorResponseWhenRequestBodyIsInvalid() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.message").value("요청 값이 올바르지 않습니다."))
                .andExpect(jsonPath("$.timestamp").value(FIXED_TIME.toString()))
                .andExpect(jsonPath("$.path").value("/test/validation"))
                .andExpect(jsonPath("$.details[0].field").value("name"))
                .andExpect(jsonPath("$.details[0].reason").value("must not be blank"));
    }

    @Test
    void shouldNotExposeParserDetailsWhenRequestBodyCannotBeRead() throws Exception {
        mockMvc.perform(post("/test/validation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_REQUEST"))
                .andExpect(jsonPath("$.details").isEmpty());
    }

    @Test
    void shouldUseCoordinateErrorCodeForCoordinateConstraintViolations() {
        @SuppressWarnings("unchecked")
        ConstraintViolation<Object> violation = mock(ConstraintViolation.class);
        Path path = mock(Path.class);
        when(path.toString()).thenReturn("getForecast.latitude");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must be between -90 and 90");
        ConstraintViolationException exception = new ConstraintViolationException(
                Set.of(violation)
        );
        jakarta.servlet.http.HttpServletRequest request =
                mock(jakarta.servlet.http.HttpServletRequest.class);
        when(request.getRequestURI()).thenReturn("/api/v1/observations");
        GlobalExceptionHandler handler = new GlobalExceptionHandler(
                Clock.fixed(FIXED_TIME, ZoneOffset.UTC)
        );

        ApiErrorResponse response = handler.handleConstraintViolation(exception, request)
                .getBody();

        assertThat(response).isNotNull();
        assertThat(response.code()).isEqualTo("INVALID_COORDINATE");
        assertThat(response.message()).isEqualTo("위도 또는 경도 값이 올바르지 않습니다.");
        assertThat(response.details()).singleElement()
                .extracting(ApiFieldError::field)
                .isEqualTo("getForecast.latitude");
    }

    @RestController
    @RequestMapping("/test")
    static class ValidationTestController {

        @PostMapping("/validation")
        void validate(@Valid @RequestBody ValidationTestRequest request) {
        }
    }

    record ValidationTestRequest(@NotBlank String name) {
    }
}
