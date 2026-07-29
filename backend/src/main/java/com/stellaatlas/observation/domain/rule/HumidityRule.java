package com.stellaatlas.observation.domain.rule;

import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationRule;
import java.util.Optional;

public class HumidityRule implements ObservationRule {

    @Override
    public Optional<ObservationReason> evaluate(ObservationInput input) {
        double value = input.humidityPercent();
        if (value <= 70.0) {
            return Optional.empty();
        }
        if (value <= 85.0) {
            return reason(ObservationReasonCode.HIGH_HUMIDITY, -5, "습도가 높아 이슬이 생길 수 있습니다.");
        }
        if (value <= 95.0) {
            return reason(ObservationReasonCode.VERY_HIGH_HUMIDITY, -15, "높은 습도로 투명도와 장비 상태에 주의가 필요합니다.");
        }
        return reason(ObservationReasonCode.EXTREME_HUMIDITY, -25, "습도가 매우 높아 이슬과 안개 가능성이 큽니다.");
    }

    private Optional<ObservationReason> reason(
            ObservationReasonCode code,
            int impact,
            String message
    ) {
        return Optional.of(new ObservationReason(code, impact, message));
    }
}
