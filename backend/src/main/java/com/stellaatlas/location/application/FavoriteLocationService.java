package com.stellaatlas.location.application;

import com.stellaatlas.location.domain.FavoriteLocation;
import com.stellaatlas.location.domain.FavoriteLocationNotFoundException;
import com.stellaatlas.location.domain.FavoriteLocationRepository;
import com.stellaatlas.location.domain.TimeZoneResolver;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FavoriteLocationService {

    private final FavoriteLocationRepository locations;
    private final TimeZoneResolver timeZoneResolver;
    private final Clock clock;

    public FavoriteLocationService(
            FavoriteLocationRepository locations,
            TimeZoneResolver timeZoneResolver,
            Clock clock
    ) {
        this.locations = locations;
        this.timeZoneResolver = timeZoneResolver;
        this.clock = clock;
    }

    @Transactional
    public FavoriteLocation create(
            UUID userId,
            String name,
            BigDecimal latitude,
            BigDecimal longitude
    ) {
        ZoneId timezone = timeZoneResolver.resolve(latitude.doubleValue(), longitude.doubleValue());
        return locations.save(new FavoriteLocation(
                UUID.randomUUID(),
                userId,
                name,
                latitude,
                longitude,
                timezone,
                clock.instant()
        ));
    }

    @Transactional(readOnly = true)
    public List<FavoriteLocation> getAll(UUID userId) {
        return locations.findAllByUserId(userId);
    }

    @Transactional(readOnly = true)
    public FavoriteLocation get(UUID userId, UUID locationId) {
        return locations.findByIdAndUserId(locationId, userId)
                .orElseThrow(() -> new FavoriteLocationNotFoundException(locationId));
    }

    @Transactional
    public void delete(UUID userId, UUID locationId) {
        if (!locations.deleteByIdAndUserId(locationId, userId)) {
            throw new FavoriteLocationNotFoundException(locationId);
        }
    }
}
