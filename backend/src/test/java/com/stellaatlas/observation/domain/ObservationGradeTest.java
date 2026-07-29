package com.stellaatlas.observation.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class ObservationGradeTest {

    @Test
    void shouldApplyDocumentedGradeBoundaries() {
        assertThat(ObservationGrade.fromScore(100)).isEqualTo(ObservationGrade.EXCELLENT);
        assertThat(ObservationGrade.fromScore(85)).isEqualTo(ObservationGrade.EXCELLENT);
        assertThat(ObservationGrade.fromScore(84)).isEqualTo(ObservationGrade.GOOD);
        assertThat(ObservationGrade.fromScore(70)).isEqualTo(ObservationGrade.GOOD);
        assertThat(ObservationGrade.fromScore(69)).isEqualTo(ObservationGrade.FAIR);
        assertThat(ObservationGrade.fromScore(50)).isEqualTo(ObservationGrade.FAIR);
        assertThat(ObservationGrade.fromScore(49)).isEqualTo(ObservationGrade.POOR);
        assertThat(ObservationGrade.fromScore(0)).isEqualTo(ObservationGrade.POOR);
    }

    @Test
    void shouldRejectScoresOutsideRange() {
        assertThatThrownBy(() -> ObservationGrade.fromScore(-1))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> ObservationGrade.fromScore(101))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
