package com.stellaatlas.weather.domain;

import java.time.Instant;
import java.util.Objects;

public record HourlyWeatherCondition(
        Instant forecastAt,
        double temperatureCelsius,
        double cloudCoverPercent,
        double precipitationProbabilityPercent,
        double humidityPercent,
        double visibilityMeters,
        double windSpeedMetersPerSecond
) {
    public HourlyWeatherCondition {
        Objects.requireNonNull(forecastAt, "forecastAt must not be null");
        requireFinite(temperatureCelsius, "temperatureCelsius");
        requirePercentage(cloudCoverPercent, "cloudCoverPercent");
        requirePercentage(precipitationProbabilityPercent, "precipitationProbabilityPercent");
        requirePercentage(humidityPercent, "humidityPercent");
        requireNonNegative(visibilityMeters, "visibilityMeters");
        requireNonNegative(windSpeedMetersPerSecond, "windSpeedMetersPerSecond");
    }

    private static void requirePercentage(double value, String name) {
        requireFinite(value, name);
        if (value < 0 || value > 100) {
            throw new IllegalArgumentException(name + " must be between 0 and 100");
        }
    }

    private static void requireNonNegative(double value, String name) {
        requireFinite(value, name);
        if (value < 0) {
            throw new IllegalArgumentException(name + " must not be negative");
        }
    }

    private static void requireFinite(double value, String name) {
        if (!Double.isFinite(value)) {
            throw new IllegalArgumentException(name + " must be finite");
        }
    }
}
