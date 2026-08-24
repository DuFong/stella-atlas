package com.stellaatlas.location.application;

import com.stellaatlas.location.domain.RecentLocation;
import com.stellaatlas.location.domain.RecentLocationRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class RecentLocationService {

    public static final int RETENTION_LIMIT = 10;
    private static final int COORDINATE_SCALE = 4;

    private final RecentLocationRepository locations;
    private final Clock clock;

    public RecentLocationService(RecentLocationRepository locations, Clock clock) {
        this.locations = locations;
        this.clock = clock;
    }

    @Transactional
    public void record(UUID userId, double latitude, double longitude, ZoneId timezone) {
        RecentLocation location = new RecentLocation(
                UUID.randomUUID(),
                userId,
                rounded(latitude),
                rounded(longitude),
                timezone,
                clock.instant()
        );
        locations.saveOrUpdate(location);
        locations.retainNewest(userId, RETENTION_LIMIT);
    }

    @Transactional(readOnly = true)
    public List<RecentLocation> getAll(UUID userId) {
        return locations.findAllByUserId(userId);
    }

    @Transactional
    public void clear(UUID userId) {
        locations.deleteAllByUserId(userId);
    }

    private BigDecimal rounded(double coordinate) {
        return BigDecimal.valueOf(coordinate).setScale(COORDINATE_SCALE, RoundingMode.HALF_UP);
    }
}
