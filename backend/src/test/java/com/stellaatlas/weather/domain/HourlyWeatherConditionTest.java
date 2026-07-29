package com.stellaatlas.weather.domain;

import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class HourlyWeatherConditionTest {

    private static final Instant FORECAST_AT =
            Instant.parse("2026-08-01T13:00:00Z");

    @Test
    void shouldAcceptValidWeatherValues() {
        assertThatCode(() -> condition(12, 30, 40, 70, 15_000, 2.5))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldRejectPercentageOutsideSupportedRange() {
        assertThatThrownBy(() -> condition(12, 101, 40, 70, 15_000, 2.5))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("cloudCoverPercent must be between 0 and 100");
    }

    @Test
    void shouldRejectNegativeVisibility() {
        assertThatThrownBy(() -> condition(12, 30, 40, 70, -1, 2.5))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("visibilityMeters must not be negative");
    }

    private static HourlyWeatherCondition condition(
            double temperature,
            double cloudCover,
            double precipitationProbability,
            double humidity,
            double visibility,
            double windSpeed
    ) {
        return new HourlyWeatherCondition(
                FORECAST_AT,
                temperature,
                cloudCover,
                precipitationProbability,
                humidity,
                visibility,
                windSpeed
        );
    }
}
