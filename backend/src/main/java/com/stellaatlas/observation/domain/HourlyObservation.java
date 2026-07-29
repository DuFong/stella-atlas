package com.stellaatlas.observation.domain;

import java.time.Instant;
import java.util.Objects;

public record HourlyObservation(
        Instant observedAt,
        ObservationEvaluation evaluation
) {

    public HourlyObservation {
        Objects.requireNonNull(observedAt, "observedAt must not be null");
        Objects.requireNonNull(evaluation, "evaluation must not be null");
    }
}
