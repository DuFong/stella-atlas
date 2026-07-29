package com.stellaatlas.astronomy.domain;

import java.time.LocalDate;
import java.util.Objects;

public record AstronomyQuery(double latitude, double longitude, LocalDate date) {

    public AstronomyQuery {
        if (!Double.isFinite(latitude) || latitude < -90.0 || latitude > 90.0) {
            throw new IllegalArgumentException("latitude must be between -90 and 90");
        }
        if (!Double.isFinite(longitude) || longitude < -180.0 || longitude > 180.0) {
            throw new IllegalArgumentException("longitude must be between -180 and 180");
        }
        Objects.requireNonNull(date, "date must not be null");
    }
}
