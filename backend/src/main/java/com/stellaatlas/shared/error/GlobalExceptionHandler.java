package com.stellaatlas.shared.error;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String INVALID_REQUEST = "INVALID_REQUEST";
    private static final String INVALID_REQUEST_MESSAGE = "요청 값이 올바르지 않습니다.";
    private static final String INVALID_COORDINATE = "INVALID_COORDINATE";
    private static final String INVALID_COORDINATE_MESSAGE = "위도 또는 경도 값이 올바르지 않습니다.";

    private final Clock clock;

    public GlobalExceptionHandler(Clock clock) {
        this.clock = clock;
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleMethodArgumentNotValid(
            MethodArgumentNotValidException exception,
            HttpServletRequest request
    ) {
        List<ApiFieldError> details = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> new ApiFieldError(error.getField(), error.getDefaultMessage()))
                .toList();

        return badRequest(request, INVALID_REQUEST, INVALID_REQUEST_MESSAGE, details);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception,
            HttpServletRequest request
    ) {
        List<ApiFieldError> details = exception.getConstraintViolations()
                .stream()
                .map(violation -> new ApiFieldError(
                        violation.getPropertyPath().toString(),
                        violation.getMessage()
                ))
                .toList();

        boolean coordinateViolation = details.stream()
                .map(ApiFieldError::field)
                .anyMatch(field -> field.endsWith("latitude") || field.endsWith("longitude"));
        return coordinateViolation
                ? badRequest(request, INVALID_COORDINATE, INVALID_COORDINATE_MESSAGE, details)
                : badRequest(request, INVALID_REQUEST, INVALID_REQUEST_MESSAGE, details);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableMessage(
            HttpMessageNotReadableException exception,
            HttpServletRequest request
    ) {
        return badRequest(
                request,
                INVALID_REQUEST,
                INVALID_REQUEST_MESSAGE,
                List.of()
        );
    }

    @ExceptionHandler({
            MethodArgumentTypeMismatchException.class,
            MissingServletRequestParameterException.class
    })
    public ResponseEntity<ApiErrorResponse> handleRequestParameterError(
            Exception exception,
            HttpServletRequest request
    ) {
        return badRequest(
                request,
                INVALID_REQUEST,
                INVALID_REQUEST_MESSAGE,
                List.of()
        );
    }

    private ResponseEntity<ApiErrorResponse> badRequest(
            HttpServletRequest request,
            String code,
            String message,
            List<ApiFieldError> details
    ) {
        ApiErrorResponse response = new ApiErrorResponse(
                code,
                message,
                Instant.now(clock),
                request.getRequestURI(),
                details
        );

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}
