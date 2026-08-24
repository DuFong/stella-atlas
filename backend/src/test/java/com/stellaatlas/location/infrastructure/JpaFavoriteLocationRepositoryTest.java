package com.stellaatlas.location.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.location.domain.FavoriteLocation;
import com.stellaatlas.location.domain.FavoriteLocationRepository;
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
@Import(JpaFavoriteLocationRepository.class)
@Testcontainers(disabledWithoutDocker = true)
class JpaFavoriteLocationRepositoryTest {

    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID OTHER_USER_ID = UUID.fromString("20000000-0000-0000-0000-000000000002");
    private static final Instant CREATED_AT = Instant.parse("2026-08-24T04:00:00Z");

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    private FavoriteLocationRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void createUsers() {
        insertUser(USER_ID);
        insertUser(OTHER_USER_ID);
    }

    @Test
    void shouldScopeFavoriteLocationQueriesToOwner() {
        FavoriteLocation ownLocation = repository.save(location(USER_ID, "서울"));
        FavoriteLocation otherLocation = repository.save(location(OTHER_USER_ID, "부산"));

        assertThat(repository.findAllByUserId(USER_ID)).containsExactly(ownLocation);
        assertThat(repository.findByIdAndUserId(otherLocation.id(), USER_ID)).isEmpty();
    }

    @Test
    void shouldDeleteOnlyWhenLocationBelongsToOwner() {
        FavoriteLocation otherLocation = repository.save(location(OTHER_USER_ID, "부산"));

        assertThat(repository.deleteByIdAndUserId(otherLocation.id(), USER_ID)).isFalse();
        assertThat(repository.findByIdAndUserId(otherLocation.id(), OTHER_USER_ID)).isPresent();
        assertThat(repository.deleteByIdAndUserId(otherLocation.id(), OTHER_USER_ID)).isTrue();
    }

    private void insertUser(UUID userId) {
        jdbcTemplate.update(
                """
                        INSERT INTO user_account (id, created_at, updated_at)
                        VALUES (?, ?, ?)
                        """,
                userId,
                Timestamp.from(CREATED_AT),
                Timestamp.from(CREATED_AT)
        );
    }

    private FavoriteLocation location(UUID userId, String name) {
        return new FavoriteLocation(
                UUID.randomUUID(),
                userId,
                name,
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000"),
                ZoneId.of("Asia/Seoul"),
                CREATED_AT
        );
    }
}
