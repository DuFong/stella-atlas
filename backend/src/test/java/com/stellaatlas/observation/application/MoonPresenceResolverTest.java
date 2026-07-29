package com.stellaatlas.observation.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.astronomy.domain.LunarEvents;
import com.stellaatlas.astronomy.domain.LunarVisibility;
import java.time.Instant;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class MoonPresenceResolverTest {

    private final MoonPresenceResolver resolver = new MoonPresenceResolver();

    @Test
    void shouldHandleRiseBeforeSet() {
        LunarEvents events = events("2026-08-01T18:00:00Z", "2026-08-02T04:00:00Z");

        assertThat(resolver.isAboveHorizon(at("2026-08-01T17:00:00Z"), events)).isFalse();
        assertThat(resolver.isAboveHorizon(at("2026-08-01T20:00:00Z"), events)).isTrue();
        assertThat(resolver.isAboveHorizon(at("2026-08-02T05:00:00Z"), events)).isFalse();
    }

    @Test
    void shouldHandleSetBeforeRiseAndSingleTransitionDays() {
        LunarEvents setBeforeRise = events("2026-08-01T20:00:00Z", "2026-08-01T08:00:00Z");
        LunarEvents riseOnly = new LunarEvents(
                Optional.of(at("2026-08-01T20:00:00Z")),
                Optional.empty(),
                LunarVisibility.NORMAL,
                0.5,
                0.5
        );
        LunarEvents setOnly = new LunarEvents(
                Optional.empty(),
                Optional.of(at("2026-08-01T08:00:00Z")),
                LunarVisibility.NORMAL,
                0.5,
                0.5
        );

        assertThat(resolver.isAboveHorizon(at("2026-08-01T06:00:00Z"), setBeforeRise)).isTrue();
        assertThat(resolver.isAboveHorizon(at("2026-08-01T12:00:00Z"), setBeforeRise)).isFalse();
        assertThat(resolver.isAboveHorizon(at("2026-08-01T22:00:00Z"), setBeforeRise)).isTrue();
        assertThat(resolver.isAboveHorizon(at("2026-08-01T22:00:00Z"), riseOnly)).isTrue();
        assertThat(resolver.isAboveHorizon(at("2026-08-01T06:00:00Z"), setOnly)).isTrue();
    }

    @Test
    void shouldHonorAlwaysAboveAndAlwaysBelowStates() {
        LunarEvents above = new LunarEvents(
                Optional.empty(), Optional.empty(), LunarVisibility.ALWAYS_ABOVE, 0.5, 0.5
        );
        LunarEvents below = new LunarEvents(
                Optional.empty(), Optional.empty(), LunarVisibility.ALWAYS_BELOW, 0.5, 0.5
        );

        assertThat(resolver.isAboveHorizon(at("2026-08-01T12:00:00Z"), above)).isTrue();
        assertThat(resolver.isAboveHorizon(at("2026-08-01T12:00:00Z"), below)).isFalse();
    }

    private LunarEvents events(String rise, String set) {
        return new LunarEvents(
                Optional.of(at(rise)),
                Optional.of(at(set)),
                LunarVisibility.NORMAL,
                0.5,
                0.5
        );
    }

    private Instant at(String value) {
        return Instant.parse(value);
    }
}
