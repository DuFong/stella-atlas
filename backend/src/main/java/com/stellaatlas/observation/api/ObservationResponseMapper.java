package com.stellaatlas.observation.api;

import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.LunarEvents;
import com.stellaatlas.astronomy.domain.SolarEvents;
import com.stellaatlas.observation.domain.ObservationEvaluation;
import com.stellaatlas.observation.domain.ObservationForecast;
import com.stellaatlas.observation.domain.ObservationGrade;
import com.stellaatlas.observation.domain.ObservationHour;
import com.stellaatlas.observation.domain.ObservationReason;
import com.stellaatlas.observation.domain.ObservationWindow;
import com.stellaatlas.weather.domain.HourlyWeatherCondition;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import org.springframework.stereotype.Component;

@Component
class ObservationResponseMapper {

    private final Clock clock;

    ObservationResponseMapper(Clock clock) {
        this.clock = clock;
    }

    ObservationResponse map(ObservationForecast forecast) {
        ZoneId timeZone = forecast.timeZone();
        return new ObservationResponse(
                new ObservationResponse.Location(
                        forecast.latitude(),
                        forecast.longitude(),
                        timeZone.getId()
                ),
                forecast.date(),
                summary(forecast, timeZone),
                astronomy(forecast.astronomy(), timeZone),
                forecast.hourly().stream().map(hour -> hourly(hour, timeZone)).toList(),
                Instant.now(clock)
        );
    }

    private ObservationResponse.Summary summary(ObservationForecast forecast, ZoneId timeZone) {
        ObservationEvaluation summary = forecast.summary();
        return new ObservationResponse.Summary(
                summary.score(),
                summary.grade(),
                summary.recommended(),
                forecast.bestWindow().map(window -> window(window, timeZone)).orElse(null),
                summaryMessage(summary)
        );
    }

    private ObservationResponse.Window window(ObservationWindow window, ZoneId timeZone) {
        return new ObservationResponse.Window(
                window.start().atZone(timeZone),
                window.end().atZone(timeZone),
                window.averageScore()
        );
    }

    private ObservationResponse.Astronomy astronomy(
            AstronomyConditions conditions,
            ZoneId timeZone
    ) {
        SolarEvents solar = conditions.solarEvents();
        LunarEvents lunar = conditions.lunarEvents();
        return new ObservationResponse.Astronomy(
                solarEvent(solar.sunrise(), timeZone),
                solarEvent(solar.sunset(), timeZone),
                solarEvent(solar.civilTwilightStart(), timeZone),
                solarEvent(solar.civilTwilightEnd(), timeZone),
                solarEvent(solar.nauticalTwilightStart(), timeZone),
                solarEvent(solar.nauticalTwilightEnd(), timeZone),
                solarEvent(solar.astronomicalTwilightStart(), timeZone),
                solarEvent(solar.astronomicalTwilightEnd(), timeZone),
                lunar.moonrise().map(value -> value.atZone(timeZone)).orElse(null),
                lunar.moonset().map(value -> value.atZone(timeZone)).orElse(null),
                lunar.visibility(),
                lunar.phase(),
                lunar.illumination()
        );
    }

    private ObservationResponse.SolarEvent solarEvent(HorizonEvent event, ZoneId timeZone) {
        ZonedDateTime time = event.time().map(value -> value.atZone(timeZone)).orElse(null);
        return new ObservationResponse.SolarEvent(time, event.state());
    }

    private ObservationResponse.Hourly hourly(ObservationHour hour, ZoneId timeZone) {
        HourlyWeatherCondition weather = hour.weather();
        ObservationEvaluation evaluation = hour.evaluation();
        return new ObservationResponse.Hourly(
                weather.forecastAt().atZone(timeZone),
                evaluation.score(),
                evaluation.grade(),
                evaluation.recommended(),
                hour.twilightPhase(),
                hour.moonAboveHorizon(),
                new ObservationResponse.Weather(
                        weather.temperatureCelsius(),
                        weather.cloudCoverPercent(),
                        weather.precipitationProbabilityPercent(),
                        weather.humidityPercent(),
                        weather.visibilityMeters(),
                        weather.windSpeedMetersPerSecond()
                ),
                evaluation.reasons().stream().map(this::reason).toList()
        );
    }

    private ObservationResponse.Reason reason(ObservationReason reason) {
        return new ObservationResponse.Reason(
                reason.code(),
                reason.impact(),
                reason.message()
        );
    }

    private String summaryMessage(ObservationEvaluation summary) {
        if (!summary.recommended()) {
            return "추천 가능한 관측 시간대가 없습니다.";
        }
        if (summary.grade() == ObservationGrade.EXCELLENT) {
            return "별을 관측하기 매우 좋은 조건입니다.";
        }
        return "별을 관측하기 좋은 조건입니다.";
    }
}
