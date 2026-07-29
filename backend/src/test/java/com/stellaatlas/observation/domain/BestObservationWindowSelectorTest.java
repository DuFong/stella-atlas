package com.stellaatlas.observation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;

class BestObservationWindowSelectorTest {

    private final BestObservationWindowSelector selector = new BestObservationWindowSelector();

    @Test
    void shouldSelectHighestAverageContiguousRecommendedWindow() {
        Instant start = Instant.parse("2026-08-01T12:00:00Z");
        List<HourlyObservation> observations = List.of(
                hour(start, 80, true),
                hour(start.plusSeconds(3_600), 80, true),
                hour(start.plusSeconds(7_200), 60, false),
                hour(start.plusSeconds(10_800), 90, true)
        );

        assertThat(selector.select(observations)).hasValueSatisfying(window -> {
            assertThat(window.start()).isEqualTo(start.plusSeconds(10_800));
            assertThat(window.end()).isEqualTo(start.plusSeconds(14_400));
            assertThat(window.averageScore()).isEqualTo(90);
        });
    }

    @Test
    void shouldPreferLongerThenEarlierWindowWhenAverageScoresTie() {
        Instant start = Instant.parse("2026-08-01T12:00:00Z");
        List<HourlyObservation> observations = List.of(
                hour(start.plusSeconds(18_000), 80, true),
                hour(start, 80, true),
                hour(start.plusSeconds(3_600), 80, true),
                hour(start.plusSeconds(10_800), 40, false)
        );

        assertThat(selector.select(observations)).hasValueSatisfying(window -> {
            assertThat(window.start()).isEqualTo(start);
            assertThat(window.end()).isEqualTo(start.plusSeconds(7_200));
        });
    }

    @Test
    void shouldReturnEmptyWhenNoHourIsRecommended() {
        assertThat(selector.select(List.of(
                hour(Instant.parse("2026-08-01T12:00:00Z"), 69, false)
        ))).isEmpty();
    }

    private HourlyObservation hour(Instant at, int score, boolean recommended) {
        return new HourlyObservation(
                at,
                new ObservationEvaluation(
                        score,
                        ObservationGrade.fromScore(score),
                        recommended,
                        List.of(new ObservationReason(
                                ObservationReasonCode.IDEAL_CONDITIONS,
                                0,
                                "test"
                        ))
                )
        );
    }
}
