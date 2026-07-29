package com.stellaatlas.observation.api;

import com.stellaatlas.astronomy.domain.HorizonState;
import com.stellaatlas.astronomy.domain.LunarVisibility;
import com.stellaatlas.observation.domain.ObservationGrade;
import com.stellaatlas.observation.domain.ObservationReasonCode;
import com.stellaatlas.observation.domain.TwilightPhase;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;

public record ObservationResponse(
        Location location,
        LocalDate date,
        Summary summary,
        Astronomy astronomy,
        List<Hourly> hourly,
        Instant generatedAt
) {

    public record Location(double latitude, double longitude, String timezone) {
    }

    public record Summary(
            int score,
            ObservationGrade grade,
            boolean recommended,
            Window bestWindow,
            String message
    ) {
    }

    public record Window(ZonedDateTime start, ZonedDateTime end, int averageScore) {
    }

    public record Astronomy(
            SolarEvent sunrise,
            SolarEvent sunset,
            SolarEvent civilTwilightStart,
            SolarEvent civilTwilightEnd,
            SolarEvent nauticalTwilightStart,
            SolarEvent nauticalTwilightEnd,
            SolarEvent astronomicalTwilightStart,
            SolarEvent astronomicalTwilightEnd,
            ZonedDateTime moonrise,
            ZonedDateTime moonset,
            LunarVisibility lunarVisibility,
            double moonPhase,
            double moonIllumination
    ) {
    }

    public record SolarEvent(ZonedDateTime time, HorizonState state) {
    }

    public record Hourly(
            ZonedDateTime time,
            int score,
            ObservationGrade grade,
            boolean recommended,
            TwilightPhase twilightPhase,
            boolean moonAboveHorizon,
            Weather weather,
            List<Reason> reasons
    ) {
    }

    public record Weather(
            double temperatureCelsius,
            double cloudCoverPercent,
            double precipitationProbabilityPercent,
            double humidityPercent,
            double visibilityMeters,
            double windSpeedMetersPerSecond
    ) {
    }

    public record Reason(ObservationReasonCode code, int impact, String message) {
    }
}
