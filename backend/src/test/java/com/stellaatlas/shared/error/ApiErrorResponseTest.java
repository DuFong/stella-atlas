package com.stellaatlas.shared.error;

import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ApiErrorResponseTest {

    @Test
    void shouldDefensivelyCopyErrorDetails() {
        List<ApiFieldError> details = new ArrayList<>();
        details.add(new ApiFieldError("latitude", "must be between -90 and 90"));

        ApiErrorResponse response = new ApiErrorResponse(
                "INVALID_COORDINATE",
                "위도 또는 경도 값이 올바르지 않습니다.",
                Instant.parse("2026-08-01T10:02:15Z"),
                "/api/v1/observations",
                details
        );

        details.clear();

        assertThat(response.details()).hasSize(1);
        assertThatThrownBy(() -> response.details().clear())
                .isInstanceOf(UnsupportedOperationException.class);
    }

    @Test
    void shouldRejectNullErrorDetails() {
        assertThatThrownBy(() -> new ApiErrorResponse(
                "INVALID_REQUEST",
                "요청 값이 올바르지 않습니다.",
                Instant.parse("2026-08-01T10:02:15Z"),
                "/api/v1/observations",
                null
        ))
                .isInstanceOf(NullPointerException.class)
                .hasMessage("details must not be null");
    }
}
