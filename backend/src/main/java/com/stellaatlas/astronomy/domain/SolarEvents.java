package com.stellaatlas.astronomy.domain;

import java.util.Objects;

public record SolarEvents(
        HorizonEvent sunrise,
        HorizonEvent sunset,
        HorizonEvent civilTwilightStart,
        HorizonEvent civilTwilightEnd,
        HorizonEvent nauticalTwilightStart,
        HorizonEvent nauticalTwilightEnd,
        HorizonEvent astronomicalTwilightStart,
        HorizonEvent astronomicalTwilightEnd
) {

    public SolarEvents {
        Objects.requireNonNull(sunrise, "sunrise must not be null");
        Objects.requireNonNull(sunset, "sunset must not be null");
        Objects.requireNonNull(civilTwilightStart, "civilTwilightStart must not be null");
        Objects.requireNonNull(civilTwilightEnd, "civilTwilightEnd must not be null");
        Objects.requireNonNull(nauticalTwilightStart, "nauticalTwilightStart must not be null");
        Objects.requireNonNull(nauticalTwilightEnd, "nauticalTwilightEnd must not be null");
        Objects.requireNonNull(astronomicalTwilightStart, "astronomicalTwilightStart must not be null");
        Objects.requireNonNull(astronomicalTwilightEnd, "astronomicalTwilightEnd must not be null");
    }
}
