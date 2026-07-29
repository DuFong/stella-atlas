package com.stellaatlas.weather.api;

import com.stellaatlas.shared.error.ApiErrorResponse;
import com.stellaatlas.weather.domain.WeatherProviderResponseException;
import com.stellaatlas.weather.domain.WeatherProviderUnavailableException;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@RestControllerAdvice
class WeatherExceptionHandler {

    private static final String EXTERNAL_PROVIDER_ERROR = "EXTERNAL_PROVIDER_ERROR";
    private static final String EXTERNAL_PROVIDER_ERROR_MESSAGE =
            "날씨 공급자의 응답을 처리할 수 없습니다.";
    private static final String WEATHER_PROVIDER_UNAVAILABLE =
            "WEATHER_PROVIDER_UNAVAILABLE";
    private static final String WEATHER_PROVIDER_UNAVAILABLE_MESSAGE =
            "날씨 정보를 일시적으로 불러올 수 없습니다.";

    private final Clock clock;

    WeatherExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    @ExceptionHandler(WeatherProviderUnavailableException.class)
    ResponseEntity<ApiErrorResponse> handleWeatherProviderUnavailable(
            WeatherProviderUnavailableException exception,
            HttpServletRequest request
    ) {
        return providerError(
                request,
                HttpStatus.SERVICE_UNAVAILABLE,
                WEATHER_PROVIDER_UNAVAILABLE,
                WEATHER_PROVIDER_UNAVAILABLE_MESSAGE
        );
    }

    @ExceptionHandler(WeatherProviderResponseException.class)
    ResponseEntity<ApiErrorResponse> handleWeatherProviderResponse(
            WeatherProviderResponseException exception,
            HttpServletRequest request
    ) {
        return providerError(
                request,
                HttpStatus.BAD_GATEWAY,
                EXTERNAL_PROVIDER_ERROR,
                EXTERNAL_PROVIDER_ERROR_MESSAGE
        );
    }

    private ResponseEntity<ApiErrorResponse> providerError(
            HttpServletRequest request,
            HttpStatus status,
            String code,
            String message
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                code,
                message,
                Instant.now(clock),
                request.getRequestURI(),
                List.of()
        );

        return ResponseEntity.status(status).body(response);
    }
}
