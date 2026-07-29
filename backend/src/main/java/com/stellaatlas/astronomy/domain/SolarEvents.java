package com.stellaatlas.astronomy.domain;

import java.util.Objects;

public record SolarEvents(
        HorizonEvent sunset,
        HorizonEvent civilTwilightEnd,
        HorizonEvent nauticalTwilightEnd,
        HorizonEvent astronomicalTwilightEnd
) {

    public SolarEvents {
        Objects.requireNonNull(sunset, "sunset must not be null");
        Objects.requireNonNull(civilTwilightEnd, "civilTwilightEnd must not be null");
        Objects.requireNonNull(nauticalTwilightEnd, "nauticalTwilightEnd must not be null");
        Objects.requireNonNull(astronomicalTwilightEnd, "astronomicalTwilightEnd must not be null");
    }
}
