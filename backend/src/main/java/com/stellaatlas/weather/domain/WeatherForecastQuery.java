package com.stellaatlas.weather.domain;

import java.time.LocalDate;
import java.util.Objects;

public record WeatherForecastQuery(
        double latitude,
        double longitude,
        LocalDate date
) {
    public WeatherForecastQuery {
        if (!Double.isFinite(latitude) || latitude < -90 || latitude > 90) {
            throw new IllegalArgumentException("latitude must be between -90 and 90");
        }
        if (!Double.isFinite(longitude) || longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("longitude must be between -180 and 180");
        }
        Objects.requireNonNull(date, "date must not be null");
    }
}
