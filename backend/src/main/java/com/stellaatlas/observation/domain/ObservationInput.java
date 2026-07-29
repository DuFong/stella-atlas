package com.stellaatlas.observation.domain;

import java.util.Objects;

public record ObservationInput(
        double cloudCoverPercent,
        double precipitationProbabilityPercent,
        double humidityPercent,
        double visibilityMeters,
        double windSpeedMetersPerSecond,
        double moonIllumination,
        boolean moonAboveHorizon,
        TwilightPhase twilightPhase
) {

    public ObservationInput {
        requirePercentage(cloudCoverPercent, "cloudCoverPercent");
        requirePercentage(precipitationProbabilityPercent, "precipitationProbabilityPercent");
        requirePercentage(humidityPercent, "humidityPercent");
        requireNonNegative(visibilityMeters, "visibilityMeters");
        requireNonNegative(windSpeedMetersPerSecond, "windSpeedMetersPerSecond");
        requireRatio(moonIllumination, "moonIllumination");
        Objects.requireNonNull(twilightPhase, "twilightPhase must not be null");
    }

    private static void requirePercentage(double value, String name) {
        requireFinite(value, name);
        if (value < 0.0 || value > 100.0) {
            throw new IllegalArgumentException(name + " must be between 0 and 100");
        }
    }

    private static void requireNonNegative(double value, String name) {
        requireFinite(value, name);
        if (value < 0.0) {
            throw new IllegalArgumentException(name + " must not be negative");
        }
    }

    private static void requireRatio(double value, String name) {
        requireFinite(value, name);
        if (value < 0.0 || value > 1.0) {
            throw new IllegalArgumentException(name + " must be between 0 and 1");
        }
    }

    private static void requireFinite(double value, String name) {
        if (!Double.isFinite(value)) {
            throw new IllegalArgumentException(name + " must be finite");
        }
    }
}
