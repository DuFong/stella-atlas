package com.stellaatlas.observation.domain;

import java.util.List;
import java.util.Objects;

public record ObservationEvaluation(
        int score,
        ObservationGrade grade,
        boolean recommended,
        List<ObservationReason> reasons
) {

    public ObservationEvaluation {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("score must be between 0 and 100");
        }
        Objects.requireNonNull(grade, "grade must not be null");
        reasons = List.copyOf(Objects.requireNonNull(reasons, "reasons must not be null"));
        if (reasons.isEmpty()) {
            throw new IllegalArgumentException("reasons must not be empty");
        }
    }
}
