package com.stellaatlas.location.infrastructure;

import com.stellaatlas.location.domain.FavoriteLocation;
import com.stellaatlas.location.domain.FavoriteLocationRepository;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class JpaFavoriteLocationRepository implements FavoriteLocationRepository {

    private final SpringDataFavoriteLocationRepository locations;

    JpaFavoriteLocationRepository(SpringDataFavoriteLocationRepository locations) {
        this.locations = locations;
    }

    @Override
    public FavoriteLocation save(FavoriteLocation location) {
        FavoriteLocationJpaEntity entity = new FavoriteLocationJpaEntity(
                location.id(),
                location.userId(),
                location.name(),
                location.latitude(),
                location.longitude(),
                location.timezone().getId(),
                location.createdAt()
        );
        return toDomain(locations.save(entity));
    }

    @Override
    public List<FavoriteLocation> findAllByUserId(UUID userId) {
        return locations.findAllByUserIdOrderByCreatedAtAscIdAsc(userId).stream()
                .map(JpaFavoriteLocationRepository::toDomain)
                .toList();
    }

    @Override
    public Optional<FavoriteLocation> findByIdAndUserId(UUID locationId, UUID userId) {
        return locations.findByIdAndUserId(locationId, userId)
                .map(JpaFavoriteLocationRepository::toDomain);
    }

    @Override
    public boolean deleteByIdAndUserId(UUID locationId, UUID userId) {
        return locations.deleteByIdAndUserId(locationId, userId) == 1;
    }

    private static FavoriteLocation toDomain(FavoriteLocationJpaEntity entity) {
        return new FavoriteLocation(
                entity.getId(),
                entity.getUserId(),
                entity.getName(),
                entity.getLatitude(),
                entity.getLongitude(),
                ZoneId.of(entity.getTimezone()),
                entity.getCreatedAt()
        );
    }
}
