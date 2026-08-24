package com.stellaatlas.location.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.location.domain.RecentLocation;
import com.stellaatlas.location.domain.RecentLocationRepository;
import java.math.BigDecimal;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(JpaRecentLocationRepository.class)
@Testcontainers(disabledWithoutDocker = true)
class JpaRecentLocationRepositoryTest {

    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID OTHER_USER_ID = UUID.fromString("20000000-0000-0000-0000-000000000002");
    private static final Instant NOW = Instant.parse("2026-08-24T05:00:00Z");

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    private RecentLocationRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void createUsers() {
        insertUser(USER_ID);
        insertUser(OTHER_USER_ID);
    }

    @Test
    void shouldRefreshMatchingCoordinatesWithoutCreatingDuplicate() {
        repository.saveOrUpdate(location(USER_ID, NOW));
        repository.saveOrUpdate(location(USER_ID, NOW.plusSeconds(60)));

        assertThat(repository.findAllByUserId(USER_ID))
                .singleElement()
                .extracting(RecentLocation::lastQueriedAt)
                .isEqualTo(NOW.plusSeconds(60));
    }

    @Test
    void shouldRetainNewestLocationsForOnlyRequestedOwner() {
        for (int index = 0; index < 12; index++) {
            repository.saveOrUpdate(new RecentLocation(
                    UUID.randomUUID(),
                    USER_ID,
                    new BigDecimal("37.%04d".formatted(index)),
                    new BigDecimal("126.%04d".formatted(index)),
                    ZoneId.of("Asia/Seoul"),
                    NOW.plusSeconds(index)
            ));
        }
        repository.saveOrUpdate(location(OTHER_USER_ID, NOW));

        repository.retainNewest(USER_ID, 10);

        assertThat(repository.findAllByUserId(USER_ID)).hasSize(10);
        assertThat(repository.findAllByUserId(OTHER_USER_ID)).hasSize(1);
    }

    private void insertUser(UUID userId) {
        jdbcTemplate.update(
                "INSERT INTO user_account (id, created_at, updated_at) VALUES (?, ?, ?)",
                userId,
                Timestamp.from(NOW),
                Timestamp.from(NOW)
        );
    }

    private RecentLocation location(UUID userId, Instant queriedAt) {
        return new RecentLocation(
                UUID.randomUUID(),
                userId,
                new BigDecimal("37.5665"),
                new BigDecimal("126.9780"),
                ZoneId.of("Asia/Seoul"),
                queriedAt
        );
    }
}
