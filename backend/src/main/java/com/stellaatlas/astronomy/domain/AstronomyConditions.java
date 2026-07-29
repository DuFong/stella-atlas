package com.stellaatlas.astronomy.domain;

import java.time.ZoneId;
import java.util.Objects;

public record AstronomyConditions(
        ZoneId timeZone,
        SolarEvents solarEvents,
        LunarEvents lunarEvents
) {

    public AstronomyConditions {
        Objects.requireNonNull(timeZone, "timeZone must not be null");
        Objects.requireNonNull(solarEvents, "solarEvents must not be null");
        Objects.requireNonNull(lunarEvents, "lunarEvents must not be null");
    }
}
