package com.stellaatlas.location.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.ZoneId;
import net.iakovlev.timeshape.TimeZoneEngine;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

class TimeshapeTimeZoneResolverTest {

    private static TimeshapeTimeZoneResolver resolver;

    @BeforeAll
    static void initializeEngine() {
        resolver = new TimeshapeTimeZoneResolver(TimeZoneEngine.initialize());
    }

    @Test
    void shouldResolveRepresentativeLandCoordinates() {
        assertThat(resolver.resolve(37.5665, 126.9780)).isEqualTo(ZoneId.of("Asia/Seoul"));
        assertThat(resolver.resolve(40.7128, -74.0060)).isEqualTo(ZoneId.of("America/New_York"));
        assertThat(resolver.resolve(69.6492, 18.9553)).isEqualTo(ZoneId.of("Europe/Oslo"));
    }

    @Test
    void shouldResolveOceanCoordinatesToAnEtcTimeZone() {
        assertThat(resolver.resolve(0.0, -140.0).getId()).startsWith("Etc/GMT");
    }
}
