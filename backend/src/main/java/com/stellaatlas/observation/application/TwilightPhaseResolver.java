package com.stellaatlas.observation.application;

import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.HorizonState;
import com.stellaatlas.astronomy.domain.SolarEvents;
import com.stellaatlas.observation.domain.ObservationDataUnavailableException;
import com.stellaatlas.observation.domain.TwilightPhase;
import java.time.Instant;

class TwilightPhaseResolver {

    TwilightPhase resolve(Instant observedAt, SolarEvents events) {
        if (isBelow(
                observedAt,
                events.astronomicalTwilightStart(),
                events.astronomicalTwilightEnd()
        )) {
            return TwilightPhase.DARK;
        }
        if (isBelow(
                observedAt,
                events.nauticalTwilightStart(),
                events.nauticalTwilightEnd()
        )) {
            return TwilightPhase.ASTRONOMICAL;
        }
        if (isBelow(
                observedAt,
                events.civilTwilightStart(),
                events.civilTwilightEnd()
        )) {
            return TwilightPhase.NAUTICAL;
        }
        if (isBelow(observedAt, events.sunrise(), events.sunset())) {
            return TwilightPhase.CIVIL;
        }
        return TwilightPhase.DAYLIGHT;
    }

    private boolean isBelow(Instant observedAt, HorizonEvent rise, HorizonEvent set) {
        if (rise.state() != set.state()) {
            throw new ObservationDataUnavailableException(
                    "Solar rise and set states are inconsistent"
            );
        }
        return switch (rise.state()) {
            case ALWAYS_BELOW -> true;
            case ALWAYS_ABOVE -> false;
            case OCCURS -> observedAt.isBefore(rise.time().orElseThrow())
                    || !observedAt.isBefore(set.time().orElseThrow());
        };
    }
}
