package com.stellaatlas.observation.domain;

import java.util.List;
import java.util.Objects;

public class DefaultObservationScorePolicy implements ObservationScorePolicy {

    private static final int BASE_SCORE = 100;
    private static final int RECOMMENDED_SCORE = 70;

    private final List<ObservationRule> rules;

    public DefaultObservationScorePolicy(List<ObservationRule> rules) {
        this.rules = List.copyOf(Objects.requireNonNull(rules, "rules must not be null"));
        if (this.rules.isEmpty()) {
            throw new IllegalArgumentException("rules must not be empty");
        }
    }

    @Override
    public ObservationEvaluation evaluate(ObservationInput input) {
        List<ObservationReason> reasons = rules.stream()
                .map(rule -> rule.evaluate(input))
                .flatMap(java.util.Optional::stream)
                .toList();
        int score = Math.clamp(
                BASE_SCORE + reasons.stream().mapToInt(ObservationReason::impact).sum(),
                0,
                100
        );
        List<ObservationReason> reportedReasons = reasons.isEmpty()
                ? List.of(new ObservationReason(
                        ObservationReasonCode.IDEAL_CONDITIONS,
                        0,
                        "뚜렷한 방해 요인이 없어 관측에 유리합니다."
                ))
                : reasons;
        return new ObservationEvaluation(
                score,
                ObservationGrade.fromScore(score),
                score >= RECOMMENDED_SCORE && input.twilightPhase() == TwilightPhase.DARK,
                reportedReasons
        );
    }
}
