package com.stellaatlas.observation.domain;

import java.util.Objects;

public record ObservationReason(
        ObservationReasonCode code,
        int impact,
        String message
) {

    public ObservationReason {
        Objects.requireNonNull(code, "code must not be null");
        if (impact < -100 || impact > 0) {
            throw new IllegalArgumentException("impact must be between -100 and 0");
        }
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("message must not be blank");
        }
    }
}
