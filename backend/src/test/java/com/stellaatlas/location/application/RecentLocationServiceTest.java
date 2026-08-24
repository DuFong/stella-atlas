package com.stellaatlas.location.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.location.domain.RecentLocation;
import com.stellaatlas.location.domain.RecentLocationRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class RecentLocationServiceTest {

    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID OTHER_USER_ID = UUID.fromString("20000000-0000-0000-0000-000000000002");
    private static final Instant NOW = Instant.parse("2026-08-24T05:00:00Z");

    private InMemoryRecentLocationRepository repository;
    private RecentLocationService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryRecentLocationRepository();
        service = new RecentLocationService(
                repository,
                Clock.fixed(NOW, ZoneOffset.UTC)
        );
    }

    @Test
    void shouldMinimizeCoordinatePrecisionAndRefreshExistingLocation() {
        service.record(USER_ID, 37.5665123, 126.9780432, ZoneId.of("Asia/Seoul"));
        service.record(USER_ID, 37.56651, 126.97804, ZoneId.of("Asia/Seoul"));

        List<RecentLocation> locations = service.getAll(USER_ID);

        assertThat(locations).hasSize(1);
        assertThat(locations.getFirst().latitude().toPlainString()).isEqualTo("37.5665");
        assertThat(locations.getFirst().longitude().toPlainString()).isEqualTo("126.9780");
    }

    @Test
    void shouldRetainOnlyTenNewestLocationsPerUser() {
        for (int index = 0; index < 12; index++) {
            service.record(USER_ID, 30 + index, 120 + index, ZoneId.of("Asia/Seoul"));
        }
        service.record(OTHER_USER_ID, 35, 125, ZoneId.of("Asia/Seoul"));

        assertThat(service.getAll(USER_ID)).hasSize(RecentLocationService.RETENTION_LIMIT);
        assertThat(service.getAll(OTHER_USER_ID)).hasSize(1);
    }

    private static final class InMemoryRecentLocationRepository implements RecentLocationRepository {

        private final List<RecentLocation> locations = new ArrayList<>();

        @Override
        public RecentLocation saveOrUpdate(RecentLocation location) {
            locations.removeIf(existing -> existing.userId().equals(location.userId())
                    && existing.latitude().compareTo(location.latitude()) == 0
                    && existing.longitude().compareTo(location.longitude()) == 0);
            locations.add(location);
            return location;
        }

        @Override
        public List<RecentLocation> findAllByUserId(UUID userId) {
            return locations.stream()
                    .filter(location -> location.userId().equals(userId))
                    .sorted(Comparator.comparing(RecentLocation::lastQueriedAt).reversed()
                            .thenComparing(RecentLocation::id, Comparator.reverseOrder()))
                    .toList();
        }

        @Override
        public void retainNewest(UUID userId, int limit) {
            List<UUID> retained = findAllByUserId(userId).stream()
                    .limit(limit)
                    .map(RecentLocation::id)
                    .toList();
            locations.removeIf(location -> location.userId().equals(userId)
                    && !retained.contains(location.id()));
        }

        @Override
        public void deleteAllByUserId(UUID userId) {
            locations.removeIf(location -> location.userId().equals(userId));
        }
    }
}
