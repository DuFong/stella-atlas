package com.stellaatlas.observation.domain.rule;

import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationRule;
import java.util.Optional;

public class CloudCoverRule implements ObservationRule {

    @Override
    public Optional<ObservationReason> evaluate(ObservationInput input) {
        double value = input.cloudCoverPercent();
        if (value <= 20.0) {
            return Optional.empty();
        }
        if (value <= 40.0) {
            return reason(ObservationReasonCode.MODERATE_CLOUD_COVER, -10, "구름이 조금 예상됩니다.");
        }
        if (value <= 70.0) {
            return reason(ObservationReasonCode.HIGH_CLOUD_COVER, -25, "구름이 많아 관측이 제한될 수 있습니다.");
        }
        return reason(ObservationReasonCode.VERY_HIGH_CLOUD_COVER, -45, "하늘 대부분이 구름으로 덮일 수 있습니다.");
    }

    private Optional<ObservationReason> reason(
            ObservationReasonCode code,
            int impact,
            String message
    ) {
        return Optional.of(new ObservationReason(code, impact, message));
    }
}
