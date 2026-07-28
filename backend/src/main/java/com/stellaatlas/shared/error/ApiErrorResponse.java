package com.stellaatlas.shared.error;

import java.time.Instant;
import java.util.List;
import java.util.Objects;

public record ApiErrorResponse(
        String code,
        String message,
        Instant timestamp,
        String path,
        List<ApiFieldError> details
) {
    public ApiErrorResponse {
        Objects.requireNonNull(code, "code must not be null");
        Objects.requireNonNull(message, "message must not be null");
        Objects.requireNonNull(timestamp, "timestamp must not be null");
        Objects.requireNonNull(path, "path must not be null");
        details = List.copyOf(Objects.requireNonNull(details, "details must not be null"));
    }
}
