package com.stellaatlas.observation.domain.rule;

import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationRule;
import java.util.Optional;

public class MoonlightRule implements ObservationRule {

    @Override
    public Optional<ObservationReason> evaluate(ObservationInput input) {
        if (!input.moonAboveHorizon() || input.moonIllumination() <= 0.25) {
            return Optional.empty();
        }
        if (input.moonIllumination() <= 0.50) {
            return reason(ObservationReasonCode.MODERATE_MOONLIGHT, -4, "달빛이 희미한 천체의 대비를 조금 낮춥니다.");
        }
        if (input.moonIllumination() <= 0.75) {
            return reason(ObservationReasonCode.BRIGHT_MOONLIGHT, -8, "밝은 달빛이 희미한 천체 관측을 방해합니다.");
        }
        return reason(ObservationReasonCode.VERY_BRIGHT_MOONLIGHT, -12, "매우 밝은 달빛으로 어두운 천체의 대비가 크게 낮아집니다.");
    }

    private Optional<ObservationReason> reason(
            ObservationReasonCode code,
            int impact,
            String message
    ) {
        return Optional.of(new ObservationReason(code, impact, message));
    }
}
