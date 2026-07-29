package com.stellaatlas.observation.domain;

import com.stellaatlas.astronomy.domain.AstronomyConditions;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

public record ObservationForecast(
        double latitude,
        double longitude,
        LocalDate date,
        ZoneId timeZone,
        AstronomyConditions astronomy,
        List<ObservationHour> hourly,
        ObservationEvaluation summary,
        Optional<ObservationWindow> bestWindow
) {

    public ObservationForecast {
        Objects.requireNonNull(date, "date must not be null");
        Objects.requireNonNull(timeZone, "timeZone must not be null");
        Objects.requireNonNull(astronomy, "astronomy must not be null");
        hourly = List.copyOf(Objects.requireNonNull(hourly, "hourly must not be null"));
        if (hourly.isEmpty()) {
            throw new IllegalArgumentException("hourly must not be empty");
        }
        Objects.requireNonNull(summary, "summary must not be null");
        bestWindow = Objects.requireNonNull(bestWindow, "bestWindow must not be null");
    }
}
