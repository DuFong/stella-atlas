package com.stellaatlas.astronomy.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

public record LunarEvents(
        Optional<Instant> moonrise,
        Optional<Instant> moonset,
        LunarVisibility visibility,
        double phase,
        double illumination
) {

    public LunarEvents {
        moonrise = Objects.requireNonNull(moonrise, "moonrise must not be null");
        moonset = Objects.requireNonNull(moonset, "moonset must not be null");
        visibility = Objects.requireNonNull(visibility, "visibility must not be null");
        requireRatio(phase, "phase");
        requireRatio(illumination, "illumination");
    }

    private static void requireRatio(double value, String name) {
        if (!Double.isFinite(value) || value < 0.0 || value > 1.0) {
            throw new IllegalArgumentException(name + " must be between 0 and 1");
        }
    }
}
