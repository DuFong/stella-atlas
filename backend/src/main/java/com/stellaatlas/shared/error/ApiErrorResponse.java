package com.stellaatlas.shared.error;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        String code,
        String message,
        Instant timestamp,
        String path,
        List<ApiFieldError> details
) {
}
