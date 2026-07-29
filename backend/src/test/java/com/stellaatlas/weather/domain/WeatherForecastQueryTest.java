package com.stellaatlas.weather.domain;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class WeatherForecastQueryTest {

    private static final LocalDate DATE = LocalDate.of(2026, 8, 1);

    @Test
    void shouldAcceptCoordinateBoundaries() {
        assertThatCode(() -> new WeatherForecastQuery(-90, -180, DATE))
                .doesNotThrowAnyException();
        assertThatCode(() -> new WeatherForecastQuery(90, 180, DATE))
                .doesNotThrowAnyException();
    }

    @Test
    void shouldRejectLatitudeOutsideSupportedRange() {
        assertThatThrownBy(() -> new WeatherForecastQuery(90.1, 0, DATE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("latitude must be between -90 and 90");
    }

    @Test
    void shouldRejectLongitudeOutsideSupportedRange() {
        assertThatThrownBy(() -> new WeatherForecastQuery(0, -180.1, DATE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("longitude must be between -180 and 180");
    }
}
