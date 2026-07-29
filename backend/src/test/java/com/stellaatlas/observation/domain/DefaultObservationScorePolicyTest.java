package com.stellaatlas.observation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.observation.domain.rule.CloudCoverRule;
import com.stellaatlas.observation.domain.rule.HumidityRule;
import com.stellaatlas.observation.domain.rule.MoonlightRule;
import com.stellaatlas.observation.domain.rule.PrecipitationRule;
import com.stellaatlas.observation.domain.rule.TwilightRule;
import com.stellaatlas.observation.domain.rule.VisibilityRule;
import com.stellaatlas.observation.domain.rule.WindRule;
import java.util.List;
import org.junit.jupiter.api.Test;

class DefaultObservationScorePolicyTest {

    private final ObservationScorePolicy policy = new DefaultObservationScorePolicy(List.of(
            new CloudCoverRule(),
            new PrecipitationRule(),
            new VisibilityRule(),
            new HumidityRule(),
            new WindRule(),
            new MoonlightRule(),
            new TwilightRule()
    ));

    @Test
    void shouldReturnPerfectRecommendedScoreForIdealDarkConditions() {
        ObservationEvaluation result = policy.evaluate(input(0, 0, 50, 20_000, 0, 0, false,
                TwilightPhase.DARK));

        assertThat(result.score()).isEqualTo(100);
        assertThat(result.grade()).isEqualTo(ObservationGrade.EXCELLENT);
        assertThat(result.recommended()).isTrue();
        assertThat(result.reasons()).singleElement()
                .extracting(ObservationReason::code)
                .isEqualTo(ObservationReasonCode.IDEAL_CONDITIONS);
    }

    @Test
    void shouldCombineReasonsAndClampScoreAtZero() {
        ObservationEvaluation result = policy.evaluate(input(
                100, 100, 100, 0, 20, 1, true, TwilightPhase.DAYLIGHT
        ));

        assertThat(result.score()).isZero();
        assertThat(result.grade()).isEqualTo(ObservationGrade.POOR);
        assertThat(result.recommended()).isFalse();
        assertThat(result.reasons()).hasSize(7);
        assertThat(result.reasons()).allMatch(reason -> reason.impact() < 0);
    }

    @Test
    void shouldRequireDarknessInAdditionToRecommendedScoreBoundary() {
        ObservationEvaluation twilight = policy.evaluate(input(
                0, 0, 50, 20_000, 0, 0, false, TwilightPhase.ASTRONOMICAL
        ));
        ObservationEvaluation darkAtBoundary = policy.evaluate(input(
                0, 0, 50, 4_000, 0, 0, false, TwilightPhase.DARK
        ));

        assertThat(twilight.score()).isEqualTo(90);
        assertThat(twilight.recommended()).isFalse();
        assertThat(darkAtBoundary.score()).isEqualTo(70);
        assertThat(darkAtBoundary.recommended()).isTrue();
    }

    private ObservationInput input(
            double cloud,
            double precipitation,
            double humidity,
            double visibility,
            double wind,
            double moon,
            boolean moonAbove,
            TwilightPhase twilight
    ) {
        return new ObservationInput(
                cloud,
                precipitation,
                humidity,
                visibility,
                wind,
                moon,
                moonAbove,
                twilight
        );
    }
}
