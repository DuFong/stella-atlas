package com.stellaatlas.observation.domain.rule;

import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.ObservationRule;
import java.util.Optional;

public class TwilightRule implements ObservationRule {

    @Override
    public Optional<ObservationReason> evaluate(ObservationInput input) {
        return switch (input.twilightPhase()) {
            case DARK -> Optional.empty();
            case ASTRONOMICAL -> reason(
                    ObservationReasonCode.ASTRONOMICAL_TWILIGHT,
                    -10,
                    "천문박명이 진행 중이라 하늘이 아직 완전히 어둡지 않습니다."
            );
            case NAUTICAL -> reason(
                    ObservationReasonCode.NAUTICAL_TWILIGHT,
                    -25,
                    "항해박명 중에는 희미한 별과 천체를 보기 어렵습니다."
            );
            case CIVIL -> reason(
                    ObservationReasonCode.CIVIL_TWILIGHT,
                    -45,
                    "시민박명 중이라 별 관측에 충분히 어둡지 않습니다."
            );
            case DAYLIGHT -> reason(
                    ObservationReasonCode.DAYLIGHT,
                    -100,
                    "해가 떠 있어 별 관측을 추천하지 않습니다."
            );
        };
    }

    private Optional<ObservationReason> reason(
            ObservationReasonCode code,
            int impact,
            String message
    ) {
        return Optional.of(new ObservationReason(code, impact, message));
    }
}
