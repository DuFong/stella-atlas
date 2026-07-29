package com.stellaatlas.observation.application;

import com.stellaatlas.astronomy.application.AstronomyService;
import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.AstronomyQuery;
import com.stellaatlas.observation.domain.BestObservationWindowSelector;
import com.stellaatlas.observation.domain.ObservationDataUnavailableException;
import com.stellaatlas.observation.domain.ObservationEvaluation;
import com.stellaatlas.observation.domain.ObservationForecast;
import com.stellaatlas.observation.domain.ObservationForecastQuery;
import com.stellaatlas.observation.domain.ObservationHour;
import com.stellaatlas.observation.domain.ObservationInput;
import com.stellaatlas.observation.domain.ObservationScorePolicy;
import com.stellaatlas.observation.domain.ObservationWindow;
import com.stellaatlas.observation.domain.TwilightPhase;
import com.stellaatlas.weather.application.WeatherForecastService;
import com.stellaatlas.weather.domain.HourlyWeatherCondition;
import com.stellaatlas.weather.domain.WeatherForecast;
import com.stellaatlas.weather.domain.WeatherForecastQuery;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class ObservationForecastService {

    private final WeatherForecastService weatherService;
    private final AstronomyService astronomyService;
    private final ObservationScorePolicy scorePolicy;
    private final BestObservationWindowSelector windowSelector;
    private final TwilightPhaseResolver twilightResolver;
    private final MoonPresenceResolver moonResolver;

    public ObservationForecastService(
            WeatherForecastService weatherService,
            AstronomyService astronomyService,
            ObservationScorePolicy scorePolicy,
            BestObservationWindowSelector windowSelector,
            TwilightPhaseResolver twilightResolver,
            MoonPresenceResolver moonResolver
    ) {
        this.weatherService = weatherService;
        this.astronomyService = astronomyService;
        this.scorePolicy = scorePolicy;
        this.windowSelector = windowSelector;
        this.twilightResolver = twilightResolver;
        this.moonResolver = moonResolver;
    }

    public ObservationForecast getForecast(ObservationForecastQuery query) {
        WeatherForecast weather = weatherService.getForecast(new WeatherForecastQuery(
                query.latitude(),
                query.longitude(),
                query.date()
        ));
        AstronomyConditions firstDay = astronomyService.getConditions(new AstronomyQuery(
                query.latitude(),
                query.longitude(),
                query.date()
        ));
        AstronomyConditions secondDay = astronomyService.getConditions(new AstronomyQuery(
                query.latitude(),
                query.longitude(),
                query.date().plusDays(1)
        ));
        requireMatchingTimeZones(weather.timezone(), firstDay.timeZone(), secondDay.timeZone());

        ZoneId timeZone = firstDay.timeZone();
        Instant windowStart = query.date().atTime(12, 0).atZone(timeZone).toInstant();
        Instant windowEnd = query.date().plusDays(1).atTime(12, 0).atZone(timeZone).toInstant();
        Map<LocalDate, AstronomyConditions> astronomyByDate = Map.of(
                query.date(), firstDay,
                query.date().plusDays(1), secondDay
        );
        List<ObservationHour> hourly = weather.hourly().stream()
                .filter(condition -> !condition.forecastAt().isBefore(windowStart))
                .filter(condition -> condition.forecastAt().isBefore(windowEnd))
                .sorted(Comparator.comparing(HourlyWeatherCondition::forecastAt))
                .map(condition -> evaluateHour(condition, timeZone, astronomyByDate))
                .toList();
        if (hourly.isEmpty()) {
            throw new ObservationDataUnavailableException(
                    "Weather forecast has no hours in the observation window"
            );
        }

        Optional<ObservationWindow> bestWindow = windowSelector.select(
                hourly.stream().map(ObservationHour::toHourlyObservation).toList()
        );
        ObservationEvaluation summary = selectSummary(hourly, bestWindow);
        return new ObservationForecast(
                query.latitude(),
                query.longitude(),
                query.date(),
                timeZone,
                firstDay,
                hourly,
                summary,
                bestWindow
        );
    }

    private ObservationHour evaluateHour(
            HourlyWeatherCondition weather,
            ZoneId timeZone,
            Map<LocalDate, AstronomyConditions> astronomyByDate
    ) {
        ZonedDateTime localTime = weather.forecastAt().atZone(timeZone);
        AstronomyConditions astronomy = Optional.ofNullable(
                astronomyByDate.get(localTime.toLocalDate())
        ).orElseThrow(() -> new ObservationDataUnavailableException(
                "Astronomy data is missing for forecast date"
        ));
        TwilightPhase twilight = twilightResolver.resolve(
                weather.forecastAt(),
                astronomy.solarEvents()
        );
        boolean moonAbove = moonResolver.isAboveHorizon(
                weather.forecastAt(),
                astronomy.lunarEvents()
        );
        ObservationEvaluation evaluation = scorePolicy.evaluate(new ObservationInput(
                weather.cloudCoverPercent(),
                weather.precipitationProbabilityPercent(),
                weather.humidityPercent(),
                weather.visibilityMeters(),
                weather.windSpeedMetersPerSecond(),
                astronomy.lunarEvents().illumination(),
                moonAbove,
                twilight
        ));
        return new ObservationHour(weather, twilight, moonAbove, evaluation);
    }

    private ObservationEvaluation selectSummary(
            List<ObservationHour> hourly,
            Optional<ObservationWindow> bestWindow
    ) {
        return hourly.stream()
                .filter(hour -> bestWindow.map(window ->
                        !hour.weather().forecastAt().isBefore(window.start())
                                && hour.weather().forecastAt().isBefore(window.end())
                ).orElse(true))
                .max(Comparator.comparingInt(hour -> hour.evaluation().score()))
                .map(ObservationHour::evaluation)
                .orElseThrow();
    }

    private void requireMatchingTimeZones(ZoneId weather, ZoneId firstDay, ZoneId secondDay) {
        if (!weather.getRules().equals(firstDay.getRules())
                || !firstDay.getRules().equals(secondDay.getRules())) {
            throw new ObservationDataUnavailableException(
                    "Weather and astronomy time zones do not match"
            );
        }
    }
}
