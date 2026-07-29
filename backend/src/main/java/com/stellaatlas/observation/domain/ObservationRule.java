package com.stellaatlas.observation.domain;

import java.util.Optional;

public interface ObservationRule {

    Optional<ObservationReason> evaluate(ObservationInput input);
}
