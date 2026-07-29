package com.stellaatlas.observation.domain;

public interface ObservationScorePolicy {

    ObservationEvaluation evaluate(ObservationInput input);
}
