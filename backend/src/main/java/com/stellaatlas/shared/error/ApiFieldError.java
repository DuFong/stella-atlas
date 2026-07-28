package com.stellaatlas.shared.error;

public record ApiFieldError(
        String field,
        String reason
) {
}
