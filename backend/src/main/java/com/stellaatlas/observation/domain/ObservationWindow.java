package com.stellaatlas.observation.domain;

import java.time.Instant;
import java.util.Objects;

public record ObservationWindow(
        Instant start,
        Instant end,
        int averageScore
) {

    public ObservationWindow {
        Objects.requireNonNull(start, "start must not be null");
        Objects.requireNonNull(end, "end must not be null");
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("end must be after start");
        }
        if (averageScore < 0 || averageScore > 100) {
            throw new IllegalArgumentException("averageScore must be between 0 and 100");
        }
    }
}
