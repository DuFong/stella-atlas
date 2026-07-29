package com.stellaatlas.astronomy.domain;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class HorizonEventTest {

    @Test
    void shouldRequireTimeOnlyWhenEventOccurs() {
        assertThatThrownBy(() -> new HorizonEvent(Optional.empty(), HorizonState.OCCURS))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new HorizonEvent(
                Optional.of(Instant.parse("2026-08-01T10:00:00Z")),
                HorizonState.ALWAYS_ABOVE
        )).isInstanceOf(IllegalArgumentException.class);
    }
}
