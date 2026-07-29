package com.stellaatlas.observation.domain.rule;

import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationRule;
import java.util.Optional;

public class PrecipitationRule implements ObservationRule {

    @Override
    public Optional<ObservationReason> evaluate(ObservationInput input) {
        double value = input.precipitationProbabilityPercent();
        if (value <= 10.0) {
            return Optional.empty();
        }
        if (value <= 30.0) {
            return reason(ObservationReasonCode.MODERATE_PRECIPITATION_RISK, -10, "약한 강수 가능성이 있습니다.");
        }
        if (value <= 60.0) {
            return reason(ObservationReasonCode.HIGH_PRECIPITATION_RISK, -25, "강수 가능성이 높아 장비 보호가 필요합니다.");
        }
        return reason(ObservationReasonCode.VERY_HIGH_PRECIPITATION_RISK, -45, "강수 가능성이 매우 높아 관측이 어렵습니다.");
    }

    private Optional<ObservationReason> reason(
            ObservationReasonCode code,
            int impact,
            String message
    ) {
        return Optional.of(new ObservationReason(code, impact, message));
    }
}
