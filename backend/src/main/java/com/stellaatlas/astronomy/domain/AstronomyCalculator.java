package com.stellaatlas.astronomy.domain;

import java.time.ZoneId;

public interface AstronomyCalculator {

    AstronomyConditions calculate(AstronomyQuery query, ZoneId timeZone);
}
