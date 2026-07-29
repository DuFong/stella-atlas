package com.stellaatlas.observation.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.SolarEvents;
import com.stellaatlas.observation.domain.TwilightPhase;
import java.time.Instant;
import org.junit.jupiter.api.Test;

class TwilightPhaseResolverTest {

    private final TwilightPhaseResolver resolver = new TwilightPhaseResolver();

    @Test
    void shouldResolveEachEveningTwilightBoundary() {
        SolarEvents events = normalEvents();

        assertThat(resolver.resolve(at("2026-08-01T12:00:00Z"), events))
                .isEqualTo(TwilightPhase.DAYLIGHT);
        assertThat(resolver.resolve(at("2026-08-01T18:15:00Z"), events))
                .isEqualTo(TwilightPhase.CIVIL);
        assertThat(resolver.resolve(at("2026-08-01T18:45:00Z"), events))
                .isEqualTo(TwilightPhase.NAUTICAL);
        assertThat(resolver.resolve(at("2026-08-01T19:15:00Z"), events))
                .isEqualTo(TwilightPhase.ASTRONOMICAL);
        assertThat(resolver.resolve(at("2026-08-01T20:00:00Z"), events))
                .isEqualTo(TwilightPhase.DARK);
    }

    @Test
    void shouldResolvePolarDayAndPolarNight() {
        HorizonEvent above = HorizonEvent.alwaysAbove();
        HorizonEvent below = HorizonEvent.alwaysBelow();

        assertThat(resolver.resolve(
                at("2026-06-21T12:00:00Z"),
                new SolarEvents(above, above, above, above, above, above, above, above)
        )).isEqualTo(TwilightPhase.DAYLIGHT);
        assertThat(resolver.resolve(
                at("2026-12-21T12:00:00Z"),
                new SolarEvents(below, below, below, below, below, below, below, below)
        )).isEqualTo(TwilightPhase.DARK);
    }

    private SolarEvents normalEvents() {
        return new SolarEvents(
                occurs("2026-08-01T06:00:00Z"),
                occurs("2026-08-01T18:00:00Z"),
                occurs("2026-08-01T05:30:00Z"),
                occurs("2026-08-01T18:30:00Z"),
                occurs("2026-08-01T05:00:00Z"),
                occurs("2026-08-01T19:00:00Z"),
                occurs("2026-08-01T04:30:00Z"),
                occurs("2026-08-01T19:30:00Z")
        );
    }

    private HorizonEvent occurs(String value) {
        return HorizonEvent.occursAt(at(value));
    }

    private Instant at(String value) {
        return Instant.parse(value);
    }
}
