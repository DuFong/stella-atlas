package com.stellaatlas.record.api;

import com.stellaatlas.record.domain.ObservationRecordNotFoundException;
import com.stellaatlas.shared.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = ObservationRecordController.class)
public class ObservationRecordExceptionHandler {

    private final Clock clock;

    public ObservationRecordExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    @ExceptionHandler(ObservationRecordNotFoundException.class)
    ResponseEntity<ApiErrorResponse> handleNotFound(
            ObservationRecordNotFoundException exception,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ApiErrorResponse(
                "OBSERVATION_RECORD_NOT_FOUND",
                "관측 기록을 찾을 수 없습니다.",
                Instant.now(clock),
                request.getRequestURI(),
                List.of()
        ));
    }
}
