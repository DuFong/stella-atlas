package com.stellaatlas.astronomy.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.AstronomyQuery;
import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.HorizonState;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.stream.IntStream;
import org.junit.jupiter.api.Test;

class CommonsSuncalcAstronomyCalculatorTest {

    private final CommonsSuncalcAstronomyCalculator calculator = new CommonsSuncalcAstronomyCalculator();

    @Test
    void shouldMatchKnownSeoulSunsetAndOrderEveningTwilight() {
        ZoneId zone = ZoneId.of("Asia/Seoul");
        AstronomyConditions conditions = calculator.calculate(
                new AstronomyQuery(37.5665, 126.9780, LocalDate.of(2026, 8, 1)),
                zone
        );

        List<HorizonEvent> events = List.of(
                conditions.solarEvents().sunset(),
                conditions.solarEvents().civilTwilightEnd(),
                conditions.solarEvents().nauticalTwilightEnd(),
                conditions.solarEvents().astronomicalTwilightEnd()
        );
        assertThat(events).allMatch(event -> event.state() == HorizonState.OCCURS);
        assertThat(events)
                .extracting(event -> event.time().orElseThrow())
                .isSorted();

        ZonedDateTime sunset = conditions.solarEvents().sunset().time().orElseThrow().atZone(zone);
        assertThat(sunset.toLocalDate()).isEqualTo(LocalDate.of(2026, 8, 1));
        assertThat(Duration.between(LocalTime.of(19, 40), sunset.toLocalTime()).abs())
                .isLessThanOrEqualTo(Duration.ofMinutes(3));
        assertThat(conditions.lunarEvents().phase()).isBetween(0.0, 1.0);
        assertThat(conditions.lunarEvents().illumination()).isBetween(0.0, 1.0);
    }

    @Test
    void shouldRepresentMidnightSunWithoutInventingSunset() {
        AstronomyConditions conditions = calculator.calculate(
                new AstronomyQuery(69.6492, 18.9553, LocalDate.of(2026, 6, 21)),
                ZoneId.of("Europe/Oslo")
        );

        assertThat(conditions.solarEvents().sunset().state()).isEqualTo(HorizonState.ALWAYS_ABOVE);
        assertThat(conditions.solarEvents().sunset().time()).isEmpty();
        assertThat(conditions.solarEvents().astronomicalTwilightEnd().state())
                .isEqualTo(HorizonState.ALWAYS_ABOVE);
    }

    @Test
    void shouldRepresentPolarNightWithoutInventingSunset() {
        AstronomyConditions conditions = calculator.calculate(
                new AstronomyQuery(69.6492, 18.9553, LocalDate.of(2026, 12, 21)),
                ZoneId.of("Europe/Oslo")
        );

        assertThat(conditions.solarEvents().sunset().state()).isEqualTo(HorizonState.ALWAYS_BELOW);
        assertThat(conditions.solarEvents().sunset().time()).isEmpty();
    }

    @Test
    void shouldKeepEventsInsideTheRequestedDstTransitionDate() {
        LocalDate date = LocalDate.of(2026, 3, 8);
        ZoneId zone = ZoneId.of("America/New_York");

        AstronomyConditions conditions = calculator.calculate(
                new AstronomyQuery(40.7128, -74.0060, date),
                zone
        );

        assertThat(conditions.solarEvents().sunset().time()).hasValueSatisfying(
                instant -> assertThat(instant.atZone(zone).toLocalDate()).isEqualTo(date)
        );
        conditions.lunarEvents().moonrise().ifPresent(
                instant -> assertThat(instant.atZone(zone).toLocalDate()).isEqualTo(date)
        );
        conditions.lunarEvents().moonset().ifPresent(
                instant -> assertThat(instant.atZone(zone).toLocalDate()).isEqualTo(date)
        );
    }

    @Test
    void shouldKeepMissingMoonriseOrMoonsetEmptyInsteadOfFabricatingATime() {
        ZoneId zone = ZoneId.of("Asia/Seoul");
        LocalDate firstDate = LocalDate.of(2026, 8, 1);

        List<AstronomyConditions> month = IntStream.range(0, 31)
                .mapToObj(firstDate::plusDays)
                .map(date -> calculator.calculate(
                        new AstronomyQuery(37.5665, 126.9780, date),
                        zone
                ))
                .toList();

        assertThat(month).anyMatch(conditions ->
                conditions.lunarEvents().moonrise().isEmpty()
                        || conditions.lunarEvents().moonset().isEmpty()
        );
    }
}
