package com.stellaatlas.location.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.Objects;
import java.util.UUID;

public record RecentLocation(
        UUID id,
        UUID userId,
        BigDecimal latitude,
        BigDecimal longitude,
        ZoneId timezone,
        Instant lastQueriedAt
) {

    public RecentLocation {
        Objects.requireNonNull(id, "Recent location id is required");
        Objects.requireNonNull(userId, "Recent location owner is required");
        Objects.requireNonNull(latitude, "Recent location latitude is required");
        Objects.requireNonNull(longitude, "Recent location longitude is required");
        Objects.requireNonNull(timezone, "Recent location timezone is required");
        Objects.requireNonNull(lastQueriedAt, "Recent location query time is required");
        if (latitude.scale() > 4 || latitude.compareTo(BigDecimal.valueOf(-90)) < 0
                || latitude.compareTo(BigDecimal.valueOf(90)) > 0) {
            throw new IllegalArgumentException("Recent location latitude is invalid");
        }
        if (longitude.scale() > 4 || longitude.compareTo(BigDecimal.valueOf(-180)) < 0
                || longitude.compareTo(BigDecimal.valueOf(180)) > 0) {
            throw new IllegalArgumentException("Recent location longitude is invalid");
        }
    }
}
