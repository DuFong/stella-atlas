package com.stellaatlas.location.api;

import com.stellaatlas.location.domain.RecentLocation;
import java.math.BigDecimal;
import java.time.Instant;

public record RecentLocationResponse(
        BigDecimal latitude,
        BigDecimal longitude,
        String timezone,
        Instant lastQueriedAt
) {

    static RecentLocationResponse from(RecentLocation location) {
        return new RecentLocationResponse(
                location.latitude(),
                location.longitude(),
                location.timezone().getId(),
                location.lastQueriedAt()
        );
    }
}
