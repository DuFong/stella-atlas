package com.stellaatlas.location.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;
import java.util.UUID;

public record FavoriteLocation(
        UUID id,
        UUID userId,
        String name,
        BigDecimal latitude,
        BigDecimal longitude,
        ZoneId timezone,
        Instant createdAt
) {

    private static final BigDecimal MIN_LATITUDE = BigDecimal.valueOf(-90);
    private static final BigDecimal MAX_LATITUDE = BigDecimal.valueOf(90);
    private static final BigDecimal MIN_LONGITUDE = BigDecimal.valueOf(-180);
    private static final BigDecimal MAX_LONGITUDE = BigDecimal.valueOf(180);

    public FavoriteLocation {
        Objects.requireNonNull(id, "Favorite location id is required");
        Objects.requireNonNull(userId, "Favorite location owner is required");
        Objects.requireNonNull(name, "Favorite location name is required");
        latitude = requireCoordinate(latitude, MIN_LATITUDE, MAX_LATITUDE, "latitude");
        longitude = requireCoordinate(longitude, MIN_LONGITUDE, MAX_LONGITUDE, "longitude");
        Objects.requireNonNull(timezone, "Favorite location timezone is required");
        Objects.requireNonNull(createdAt, "Favorite location creation time is required");

        name = name.trim();
        if (name.isEmpty() || name.length() > 100) {
            throw new IllegalArgumentException("Favorite location name must contain 1 to 100 characters");
        }
    }

    private static BigDecimal requireCoordinate(
            BigDecimal value,
            BigDecimal minimum,
            BigDecimal maximum,
            String field
    ) {
        Objects.requireNonNull(value, field + " is required");
        if (value.compareTo(minimum) < 0 || value.compareTo(maximum) > 0) {
            throw new IllegalArgumentException(field + " is outside the supported range");
        }
        if (value.scale() > 6) {
            throw new IllegalArgumentException(field + " supports at most 6 decimal places");
        }
        return value;
    }
}
