package com.stellaatlas.location.application;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.stellaatlas.location.domain.FavoriteLocation;
import com.stellaatlas.location.domain.FavoriteLocationNotFoundException;
import com.stellaatlas.location.domain.FavoriteLocationRepository;
import com.stellaatlas.location.domain.TimeZoneResolver;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FavoriteLocationServiceTest {

    private static final Instant NOW = Instant.parse("2026-08-24T04:00:00Z");
    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID OTHER_USER_ID = UUID.fromString("20000000-0000-0000-0000-000000000002");

    private InMemoryFavoriteLocationRepository repository;
    private FavoriteLocationService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryFavoriteLocationRepository();
        TimeZoneResolver resolver = (latitude, longitude) -> ZoneId.of("Asia/Seoul");
        service = new FavoriteLocationService(
                repository,
                resolver,
                Clock.fixed(NOW, ZoneOffset.UTC)
        );
    }

    @Test
    void shouldCreateFavoriteLocationWithResolvedTimezone() {
        FavoriteLocation created = service.create(
                USER_ID,
                "  서울 천문대  ",
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000")
        );

        assertThat(created.userId()).isEqualTo(USER_ID);
        assertThat(created.name()).isEqualTo("서울 천문대");
        assertThat(created.timezone()).isEqualTo(ZoneId.of("Asia/Seoul"));
        assertThat(created.createdAt()).isEqualTo(NOW);
    }

    @Test
    void shouldReturnOnlyLocationsOwnedByCurrentUser() {
        service.create(USER_ID, "서울", new BigDecimal("37.566500"), new BigDecimal("126.978000"));
        service.create(OTHER_USER_ID, "부산", new BigDecimal("35.179600"), new BigDecimal("129.075600"));

        List<FavoriteLocation> locations = service.getAll(USER_ID);

        assertThat(locations).extracting(FavoriteLocation::name).containsExactly("서울");
    }

    @Test
    void shouldHideLocationOwnedByAnotherUser() {
        FavoriteLocation otherLocation = service.create(
                OTHER_USER_ID,
                "부산",
                new BigDecimal("35.179600"),
                new BigDecimal("129.075600")
        );

        assertThatThrownBy(() -> service.get(USER_ID, otherLocation.id()))
                .isInstanceOf(FavoriteLocationNotFoundException.class);
        assertThatThrownBy(() -> service.delete(USER_ID, otherLocation.id()))
                .isInstanceOf(FavoriteLocationNotFoundException.class);
    }

    private static final class InMemoryFavoriteLocationRepository implements FavoriteLocationRepository {

        private final List<FavoriteLocation> locations = new ArrayList<>();

        @Override
        public FavoriteLocation save(FavoriteLocation location) {
            locations.add(location);
            return location;
        }

        @Override
        public List<FavoriteLocation> findAllByUserId(UUID userId) {
            return locations.stream()
                    .filter(location -> location.userId().equals(userId))
                    .sorted(Comparator.comparing(FavoriteLocation::createdAt)
                            .thenComparing(FavoriteLocation::id))
                    .toList();
        }

        @Override
        public Optional<FavoriteLocation> findByIdAndUserId(UUID locationId, UUID userId) {
            return locations.stream()
                    .filter(location -> location.id().equals(locationId))
                    .filter(location -> location.userId().equals(userId))
                    .findFirst();
        }

        @Override
        public boolean deleteByIdAndUserId(UUID locationId, UUID userId) {
            return locations.removeIf(location -> location.id().equals(locationId)
                    && location.userId().equals(userId));
        }
    }
}
