package com.stellaatlas.observation.domain;

import com.stellaatlas.weather.domain.HourlyWeatherCondition;
import java.util.Objects;

public record ObservationHour(
        HourlyWeatherCondition weather,
        TwilightPhase twilightPhase,
        boolean moonAboveHorizon,
        ObservationEvaluation evaluation
) {

    public ObservationHour {
        Objects.requireNonNull(weather, "weather must not be null");
        Objects.requireNonNull(twilightPhase, "twilightPhase must not be null");
        Objects.requireNonNull(evaluation, "evaluation must not be null");
    }

    public HourlyObservation toHourlyObservation() {
        return new HourlyObservation(weather.forecastAt(), evaluation);
    }
}
