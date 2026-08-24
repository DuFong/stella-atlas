package com.stellaatlas.location.api;

import com.stellaatlas.location.domain.FavoriteLocationNotFoundException;
import com.stellaatlas.location.domain.TimeZoneResolutionException;
import com.stellaatlas.shared.error.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Clock;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice(assignableTypes = FavoriteLocationController.class)
public class FavoriteLocationExceptionHandler {

    private final Clock clock;

    public FavoriteLocationExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    @ExceptionHandler(FavoriteLocationNotFoundException.class)
    ResponseEntity<ApiErrorResponse> handleNotFound(
            FavoriteLocationNotFoundException exception,
            HttpServletRequest request
    ) {
        return response(
                HttpStatus.NOT_FOUND,
                "LOCATION_NOT_FOUND",
                "저장된 관측 위치를 찾을 수 없습니다.",
                request
        );
    }

    @ExceptionHandler(TimeZoneResolutionException.class)
    ResponseEntity<ApiErrorResponse> handleTimeZoneResolution(
            TimeZoneResolutionException exception,
            HttpServletRequest request
    ) {
        return response(
                HttpStatus.BAD_REQUEST,
                "INVALID_COORDINATE",
                "위도 또는 경도 값이 올바르지 않습니다.",
                request
        );
    }

    private ResponseEntity<ApiErrorResponse> response(
            HttpStatus status,
            String code,
            String message,
            HttpServletRequest request
    ) {
        return ResponseEntity.status(status).body(new ApiErrorResponse(
                code,
                message,
                Instant.now(clock),
                request.getRequestURI(),
                List.of()
        ));
    }
}
