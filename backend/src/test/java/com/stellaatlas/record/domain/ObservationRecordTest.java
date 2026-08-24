package com.stellaatlas.record.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class ObservationRecordTest {

    @Test
    void shouldExtractNormalizedUniqueHashtagsInCommentOrder() {
        ObservationRecord record = record("별빛 #서울 #NightSky #서울");

        assertThat(record.hashtags()).containsExactly("서울", "nightsky");
    }

    @Test
    void shouldRequireCoordinatesAsAPair() {
        assertThatThrownBy(() -> new ObservationRecord(
                UUID.randomUUID(),
                UUID.randomUUID(),
                Instant.parse("2026-08-24T12:00:00Z"),
                ZoneId.of("Asia/Seoul"),
                new BigDecimal("37.566500"),
                null,
                "관측",
                Instant.parse("2026-08-24T13:00:00Z")
        )).isInstanceOf(IllegalArgumentException.class);
    }

    private ObservationRecord record(String comment) {
        return new ObservationRecord(
                UUID.randomUUID(),
                UUID.randomUUID(),
                Instant.parse("2026-08-24T12:00:00Z"),
                ZoneId.of("Asia/Seoul"),
                new BigDecimal("37.566500"),
                new BigDecimal("126.978000"),
                comment,
                Instant.parse("2026-08-24T13:00:00Z")
        );
    }
}
