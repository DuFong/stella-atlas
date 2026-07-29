package com.stellaatlas.astronomy.application;

import com.stellaatlas.astronomy.domain.AstronomyCalculator;
import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.AstronomyQuery;
import com.stellaatlas.location.domain.TimeZoneResolver;
import java.time.ZoneId;
import org.springframework.stereotype.Service;

@Service
public class AstronomyService {

    private final TimeZoneResolver timeZoneResolver;
    private final AstronomyCalculator astronomyCalculator;

    public AstronomyService(TimeZoneResolver timeZoneResolver, AstronomyCalculator astronomyCalculator) {
        this.timeZoneResolver = timeZoneResolver;
        this.astronomyCalculator = astronomyCalculator;
    }

    public AstronomyConditions getConditions(AstronomyQuery query) {
        ZoneId timeZone = timeZoneResolver.resolve(query.latitude(), query.longitude());
        return astronomyCalculator.calculate(query, timeZone);
    }
}
