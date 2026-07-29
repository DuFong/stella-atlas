package com.stellaatlas.observation.domain.rule;

import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationRule;
import java.util.Optional;

public class VisibilityRule implements ObservationRule {

    @Override
    public Optional<ObservationReason> evaluate(ObservationInput input) {
        double value = input.visibilityMeters();
        if (value >= 15_000.0) {
            return Optional.empty();
        }
        if (value >= 10_000.0) {
            return reason(ObservationReasonCode.MODERATE_VISIBILITY, -5, "가시거리가 다소 제한됩니다.");
        }
        if (value >= 5_000.0) {
            return reason(ObservationReasonCode.LOW_VISIBILITY, -15, "낮은 가시거리로 희미한 천체 관측이 어렵습니다.");
        }
        return reason(ObservationReasonCode.VERY_LOW_VISIBILITY, -30, "가시거리가 매우 낮아 관측 조건이 좋지 않습니다.");
    }

    private Optional<ObservationReason> reason(
            ObservationReasonCode code,
            int impact,
            String message
    ) {
        return Optional.of(new ObservationReason(code, impact, message));
    }
}
