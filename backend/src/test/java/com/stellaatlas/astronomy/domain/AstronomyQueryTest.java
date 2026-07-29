package com.stellaatlas.astronomy.domain;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import org.junit.jupiter.api.Test;

class AstronomyQueryTest {

    @Test
    void shouldRejectCoordinatesOutsideSupportedRanges() {
        LocalDate date = LocalDate.of(2026, 8, 1);

        assertThatThrownBy(() -> new AstronomyQuery(90.1, 0.0, date))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("latitude");
        assertThatThrownBy(() -> new AstronomyQuery(0.0, -180.1, date))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("longitude");
        assertThatThrownBy(() -> new AstronomyQuery(Double.NaN, 0.0, date))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void shouldRequireDate() {
        assertThatThrownBy(() -> new AstronomyQuery(37.5665, 126.9780, null))
                .isInstanceOf(NullPointerException.class)
                .hasMessageContaining("date");
    }
}
