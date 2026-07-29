package com.stellaatlas.observation.api;

import com.stellaatlas.observation.domain.ObservationDataUnavailableException;
import com.stellaatlas.shared.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
class ObservationExceptionHandler {

    private static final String CODE = "OBSERVATION_DATA_UNAVAILABLE";
    private static final String MESSAGE = "관측 조건을 계산하는 데 필요한 정보가 부족합니다.";

    private final Clock clock;

    ObservationExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    @ExceptionHandler(ObservationDataUnavailableException.class)
    ResponseEntity<ApiErrorResponse> handleDataUnavailable(
            ObservationDataUnavailableException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(new ApiErrorResponse(
                CODE,
                MESSAGE,
                Instant.now(clock),
                request.getRequestURI(),
                List.of()
        ));
    }
}
