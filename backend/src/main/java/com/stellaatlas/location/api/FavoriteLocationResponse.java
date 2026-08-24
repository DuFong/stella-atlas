package com.stellaatlas.location.api;

import com.stellaatlas.location.domain.FavoriteLocation;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record FavoriteLocationResponse(
        UUID id,
        String name,
        BigDecimal latitude,
        BigDecimal longitude,
        String timezone,
        Instant createdAt
) {

    static FavoriteLocationResponse from(FavoriteLocation location) {
        return new FavoriteLocationResponse(
                location.id(),
                location.name(),
                location.latitude(),
                location.longitude(),
                location.timezone().getId(),
                location.createdAt()
        );
    }
}
