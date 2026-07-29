package com.stellaatlas.observation.domain.rule;

import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationRule;
import java.util.Optional;

public class WindRule implements ObservationRule {

    @Override
    public Optional<ObservationReason> evaluate(ObservationInput input) {
        double value = input.windSpeedMetersPerSecond();
        if (value <= 3.0) {
            return Optional.empty();
        }
        if (value <= 6.0) {
            return reason(ObservationReasonCode.MODERATE_WIND, -5, "바람이 있어 가벼운 장비가 흔들릴 수 있습니다.");
        }
        if (value <= 10.0) {
            return reason(ObservationReasonCode.STRONG_WIND, -15, "강한 바람으로 장비 안정성이 떨어질 수 있습니다.");
        }
        return reason(ObservationReasonCode.VERY_STRONG_WIND, -25, "바람이 매우 강해 야외 관측이 어렵습니다.");
    }

    private Optional<ObservationReason> reason(
            ObservationReasonCode code,
            int impact,
            String message
    ) {
        return Optional.of(new ObservationReason(code, impact, message));
    }
}
