package com.stellaatlas.location.infrastructure;

import com.stellaatlas.location.domain.RecentLocation;
import com.stellaatlas.location.domain.RecentLocationRepository;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class JpaRecentLocationRepository implements RecentLocationRepository {

    private final SpringDataRecentLocationRepository locations;

    JpaRecentLocationRepository(SpringDataRecentLocationRepository locations) {
        this.locations = locations;
    }

    @Override
    public RecentLocation saveOrUpdate(RecentLocation location) {
        RecentLocationJpaEntity entity = locations
                .findByUserIdAndLatitudeAndLongitude(
                        location.userId(),
                        location.latitude(),
                        location.longitude()
                )
                .map(existing -> {
                    existing.refresh(location.timezone().getId(), location.lastQueriedAt());
                    return existing;
                })
                .orElseGet(() -> toEntity(location));
        return toDomain(locations.save(entity));
    }

    @Override
    public List<RecentLocation> findAllByUserId(UUID userId) {
        return locations.findAllByUserIdOrderByLastQueriedAtDescIdDesc(userId).stream()
                .map(JpaRecentLocationRepository::toDomain)
                .toList();
    }

    @Override
    public void retainNewest(UUID userId, int limit) {
        List<UUID> expiredIds = locations.findAllByUserIdOrderByLastQueriedAtDescIdDesc(userId)
                .stream()
                .skip(limit)
                .map(RecentLocationJpaEntity::getId)
                .toList();
        locations.deleteAllByIdInBatch(expiredIds);
    }

    @Override
    public void deleteAllByUserId(UUID userId) {
        locations.deleteAllByUserId(userId);
    }

    private static RecentLocationJpaEntity toEntity(RecentLocation location) {
        return new RecentLocationJpaEntity(
                location.id(),
                location.userId(),
                location.latitude(),
                location.longitude(),
                location.timezone().getId(),
                location.lastQueriedAt()
        );
    }

    private static RecentLocation toDomain(RecentLocationJpaEntity entity) {
        return new RecentLocation(
                entity.getId(),
                entity.getUserId(),
                entity.getLatitude(),
                entity.getLongitude(),
                ZoneId.of(entity.getTimezone()),
                entity.getLastQueriedAt()
        );
    }
}
