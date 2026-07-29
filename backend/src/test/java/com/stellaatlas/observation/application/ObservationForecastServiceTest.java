package com.stellaatlas.observation.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.astronomy.application.AstronomyService;
import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.AstronomyQuery;
import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.LunarEvents;
import com.stellaatlas.astronomy.domain.LunarVisibility;
import com.stellaatlas.astronomy.domain.SolarEvents;
import com.stellaatlas.observation.domain.BestObservationWindowSelector;
import com.stellaatlas.observation.domain.DefaultObservationScorePolicy;
import com.stellaatlas.observation.domain.ObservationForecast;
import com.stellaatlas.observation.domain.ObservationForecastQuery;
import com.stellaatlas.observation.domain.ObservationScorePolicy;
import com.stellaatlas.observation.domain.rule.CloudCoverRule;
import com.stellaatlas.observation.domain.rule.HumidityRule;
import com.stellaatlas.observation.domain.rule.MoonlightRule;
import com.stellaatlas.observation.domain.rule.PrecipitationRule;
import com.stellaatlas.observation.domain.rule.TwilightRule;
import com.stellaatlas.observation.domain.rule.VisibilityRule;
import com.stellaatlas.observation.domain.rule.WindRule;
import com.stellaatlas.weather.application.WeatherForecastService;
import com.stellaatlas.weather.domain.HourlyWeatherCondition;
import com.stellaatlas.weather.domain.WeatherForecast;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class ObservationForecastServiceTest {

    private static final ZoneId SEOUL = ZoneId.of("Asia/Seoul");

    @Test
    void shouldScoreHourlyConditionsAndSelectWindowAcrossMidnight() {
        WeatherForecastService weatherService = new WeatherForecastService(query ->
                new WeatherForecast(SEOUL, List.of(
                        weather("2026-08-01T11:00:00Z", 0, 0),
                        weather("2026-08-01T12:00:00Z", 0, 0),
                        weather("2026-08-01T13:00:00Z", 30, 0),
                        weather("2026-08-01T14:00:00Z", 0, 0),
                        weather("2026-08-01T15:00:00Z", 0, 0),
                        weather("2026-08-01T16:00:00Z", 100, 80)
                ))
        );
        AstronomyService astronomyService = new AstronomyService(
                (latitude, longitude) -> SEOUL,
                (query, timeZone) -> astronomy(query)
        );
        ObservationForecastService service = new ObservationForecastService(
                weatherService,
                astronomyService,
                standardPolicy(),
                new BestObservationWindowSelector(),
                new TwilightPhaseResolver(),
                new MoonPresenceResolver()
        );

        ObservationForecast result = service.getForecast(new ObservationForecastQuery(
                37.5665,
                126.9780,
                LocalDate.of(2026, 8, 1)
        ));

        assertThat(result.hourly()).hasSize(6);
        assertThat(result.summary().score()).isEqualTo(100);
        assertThat(result.bestWindow()).hasValueSatisfying(window -> {
            assertThat(window.start()).isEqualTo(Instant.parse("2026-08-01T12:00:00Z"));
            assertThat(window.end()).isEqualTo(Instant.parse("2026-08-01T16:00:00Z"));
            assertThat(window.start().atZone(SEOUL).toLocalDate())
                    .isEqualTo(LocalDate.of(2026, 8, 1));
            assertThat(window.end().atZone(SEOUL).toLocalDate())
                    .isEqualTo(LocalDate.of(2026, 8, 2));
        });
    }

    private AstronomyConditions astronomy(AstronomyQuery query) {
        LocalDate date = query.date();
        return new AstronomyConditions(
                SEOUL,
                new SolarEvents(
                        event(date, 6, 0),
                        event(date, 19, 0),
                        event(date, 5, 30),
                        event(date, 19, 30),
                        event(date, 5, 0),
                        event(date, 20, 0),
                        event(date, 4, 30),
                        event(date, 21, 0)
                ),
                new LunarEvents(
                        Optional.empty(),
                        Optional.empty(),
                        LunarVisibility.ALWAYS_BELOW,
                        0.5,
                        0.8
                )
        );
    }

    private HorizonEvent event(LocalDate date, int hour, int minute) {
        return HorizonEvent.occursAt(date.atTime(hour, minute).atZone(SEOUL).toInstant());
    }

    private HourlyWeatherCondition weather(
            String forecastAt,
            double cloudCover,
            double precipitation
    ) {
        return new HourlyWeatherCondition(
                Instant.parse(forecastAt),
                20,
                cloudCover,
                precipitation,
                50,
                20_000,
                1
        );
    }

    private ObservationScorePolicy standardPolicy() {
        return new DefaultObservationScorePolicy(List.of(
                new CloudCoverRule(),
                new PrecipitationRule(),
                new VisibilityRule(),
                new HumidityRule(),
                new WindRule(),
                new MoonlightRule(),
                new TwilightRule()
        ));
    }
}
