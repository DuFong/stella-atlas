package com.stellaatlas.observation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.observation.domain.rule.CloudCoverRule;
import com.stellaatlas.observation.domain.rule.HumidityRule;
import com.stellaatlas.observation.domain.rule.MoonlightRule;
import com.stellaatlas.observation.domain.rule.PrecipitationRule;
import com.stellaatlas.observation.domain.rule.TwilightRule;
import com.stellaatlas.observation.domain.rule.VisibilityRule;
import com.stellaatlas.observation.domain.rule.WindRule;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ObservationRulesTest {

    @Test
    void shouldApplyCloudCoverBoundaries() {
        CloudCoverRule rule = new CloudCoverRule();

        assertThat(rule.evaluate(input(20, 0, 50, 20_000, 0, 0, false, TwilightPhase.DARK)))
                .isEmpty();
        assertReason(rule.evaluate(input(20.1, 0, 50, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.MODERATE_CLOUD_COVER, -10);
        assertReason(rule.evaluate(input(40.1, 0, 50, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.HIGH_CLOUD_COVER, -25);
        assertReason(rule.evaluate(input(70.1, 0, 50, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.VERY_HIGH_CLOUD_COVER, -45);
    }

    @Test
    void shouldApplyPrecipitationBoundaries() {
        PrecipitationRule rule = new PrecipitationRule();

        assertThat(rule.evaluate(input(0, 10, 50, 20_000, 0, 0, false, TwilightPhase.DARK)))
                .isEmpty();
        assertReason(rule.evaluate(input(0, 10.1, 50, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.MODERATE_PRECIPITATION_RISK, -10);
        assertReason(rule.evaluate(input(0, 30.1, 50, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.HIGH_PRECIPITATION_RISK, -25);
        assertReason(rule.evaluate(input(0, 60.1, 50, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.VERY_HIGH_PRECIPITATION_RISK, -45);
    }

    @Test
    void shouldApplyVisibilityBoundaries() {
        VisibilityRule rule = new VisibilityRule();

        assertThat(rule.evaluate(input(0, 0, 50, 15_000, 0, 0, false, TwilightPhase.DARK)))
                .isEmpty();
        assertReason(rule.evaluate(input(0, 0, 50, 14_999, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.MODERATE_VISIBILITY, -5);
        assertReason(rule.evaluate(input(0, 0, 50, 9_999, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.LOW_VISIBILITY, -15);
        assertReason(rule.evaluate(input(0, 0, 50, 4_999, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.VERY_LOW_VISIBILITY, -30);
    }

    @Test
    void shouldApplyHumidityBoundaries() {
        HumidityRule rule = new HumidityRule();

        assertThat(rule.evaluate(input(0, 0, 70, 20_000, 0, 0, false, TwilightPhase.DARK)))
                .isEmpty();
        assertReason(rule.evaluate(input(0, 0, 70.1, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.HIGH_HUMIDITY, -5);
        assertReason(rule.evaluate(input(0, 0, 85.1, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.VERY_HIGH_HUMIDITY, -15);
        assertReason(rule.evaluate(input(0, 0, 95.1, 20_000, 0, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.EXTREME_HUMIDITY, -25);
    }

    @Test
    void shouldApplyWindBoundaries() {
        WindRule rule = new WindRule();

        assertThat(rule.evaluate(input(0, 0, 50, 20_000, 3, 0, false, TwilightPhase.DARK)))
                .isEmpty();
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 3.1, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.MODERATE_WIND, -5);
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 6.1, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.STRONG_WIND, -15);
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 10.1, 0, false, TwilightPhase.DARK)),
                ObservationReasonCode.VERY_STRONG_WIND, -25);
    }

    @Test
    void shouldApplyMoonlightOnlyWhenMoonIsAboveHorizon() {
        MoonlightRule rule = new MoonlightRule();

        assertThat(rule.evaluate(input(0, 0, 50, 20_000, 0, 1, false, TwilightPhase.DARK)))
                .isEmpty();
        assertThat(rule.evaluate(input(0, 0, 50, 20_000, 0, .25, true, TwilightPhase.DARK)))
                .isEmpty();
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 0, .26, true, TwilightPhase.DARK)),
                ObservationReasonCode.MODERATE_MOONLIGHT, -4);
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 0, .51, true, TwilightPhase.DARK)),
                ObservationReasonCode.BRIGHT_MOONLIGHT, -8);
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 0, .76, true, TwilightPhase.DARK)),
                ObservationReasonCode.VERY_BRIGHT_MOONLIGHT, -12);
    }

    @Test
    void shouldApplyTwilightImpacts() {
        TwilightRule rule = new TwilightRule();

        assertThat(rule.evaluate(input(0, 0, 50, 20_000, 0, 0, false, TwilightPhase.DARK)))
                .isEmpty();
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 0, 0, false,
                        TwilightPhase.ASTRONOMICAL)),
                ObservationReasonCode.ASTRONOMICAL_TWILIGHT, -10);
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 0, 0, false, TwilightPhase.NAUTICAL)),
                ObservationReasonCode.NAUTICAL_TWILIGHT, -25);
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 0, 0, false, TwilightPhase.CIVIL)),
                ObservationReasonCode.CIVIL_TWILIGHT, -45);
        assertReason(rule.evaluate(input(0, 0, 50, 20_000, 0, 0, false, TwilightPhase.DAYLIGHT)),
                ObservationReasonCode.DAYLIGHT, -100);
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

    private void assertReason(
            Optional<ObservationReason> actual,
            ObservationReasonCode code,
            int impact
    ) {
        assertThat(actual).hasValueSatisfying(reason -> {
            assertThat(reason.code()).isEqualTo(code);
            assertThat(reason.impact()).isEqualTo(impact);
            assertThat(reason.message()).isNotBlank();
        });
    }
}
