package com.stellaatlas.record.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.record.domain.ObservationRecord;
import com.stellaatlas.record.domain.ObservationRecordRepository;
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
@Import(JpaObservationRecordRepository.class)
@Testcontainers(disabledWithoutDocker = true)
class JpaObservationRecordRepositoryTest {

    private static final UUID USER_ID = UUID.fromString("10000000-0000-0000-0000-000000000001");
    private static final UUID OTHER_USER_ID = UUID.fromString("20000000-0000-0000-0000-000000000002");
    private static final Instant NOW = Instant.parse("2026-08-24T13:00:00Z");

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    private ObservationRecordRepository repository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void createUsers() {
        insertUser(USER_ID);
        insertUser(OTHER_USER_ID);
    }

    @Test
    void shouldScopeListingAndDeletionToOwner() {
        ObservationRecord ownRecord = repository.save(record(USER_ID, NOW));
        ObservationRecord otherRecord = repository.save(record(OTHER_USER_ID, NOW.plusSeconds(1)));

        assertThat(repository.findAllByUserId(USER_ID)).containsExactly(ownRecord);
        assertThat(repository.deleteByIdAndUserId(otherRecord.id(), USER_ID)).isFalse();
        assertThat(repository.findAllByUserId(OTHER_USER_ID)).containsExactly(otherRecord);
    }

    private void insertUser(UUID userId) {
        jdbcTemplate.update(
                "INSERT INTO user_account (id, created_at, updated_at) VALUES (?, ?, ?)",
                userId,
                Timestamp.from(NOW),
                Timestamp.from(NOW)
        );
    }

    private ObservationRecord record(UUID userId, Instant createdAt) {
        return new ObservationRecord(
                UUID.randomUUID(),
                userId,
                createdAt.minusSeconds(3600),
                ZoneId.of("Asia/Seoul"),
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000"),
                "관측 #서울",
                createdAt
        );
    }
}
