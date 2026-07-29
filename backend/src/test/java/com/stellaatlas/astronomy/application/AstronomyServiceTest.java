package com.stellaatlas.astronomy.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.astronomy.domain.AstronomyCalculator;
import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.AstronomyQuery;
import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.LunarEvents;
import com.stellaatlas.astronomy.domain.LunarVisibility;
import com.stellaatlas.astronomy.domain.SolarEvents;
import com.stellaatlas.location.domain.TimeZoneResolver;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Optional;
import org.junit.jupiter.api.Test;

class AstronomyServiceTest {

    @Test
    void shouldResolveTimeZoneBeforeCalculatingConditions() {
        ZoneId seoul = ZoneId.of("Asia/Seoul");
        AstronomyQuery query = new AstronomyQuery(37.5665, 126.9780, LocalDate.of(2026, 8, 1));
        TimeZoneResolver resolver = (latitude, longitude) -> seoul;
        AstronomyCalculator calculator = (receivedQuery, receivedZone) -> conditions(receivedZone);
        AstronomyService service = new AstronomyService(resolver, calculator);

        AstronomyConditions result = service.getConditions(query);

        assertThat(result.timeZone()).isEqualTo(seoul);
    }

    private AstronomyConditions conditions(ZoneId timeZone) {
        HorizonEvent missing = HorizonEvent.alwaysAbove();
        return new AstronomyConditions(
                timeZone,
                new SolarEvents(missing, missing, missing, missing),
                new LunarEvents(
                        Optional.empty(),
                        Optional.empty(),
                        LunarVisibility.ALWAYS_ABOVE,
                        0.5,
                        1.0
                )
        );
    }
}
