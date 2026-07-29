package com.stellaatlas.observation.application;

import com.stellaatlas.astronomy.domain.LunarEvents;
import com.stellaatlas.observation.domain.ObservationDataUnavailableException;
import java.time.Instant;

class MoonPresenceResolver {

    boolean isAboveHorizon(Instant observedAt, LunarEvents events) {
        return switch (events.visibility()) {
            case ALWAYS_ABOVE -> true;
            case ALWAYS_BELOW -> false;
            case NORMAL -> resolveNormal(observedAt, events);
        };
    }

    private boolean resolveNormal(Instant observedAt, LunarEvents events) {
        if (events.moonrise().isPresent() && events.moonset().isPresent()) {
            Instant rise = events.moonrise().orElseThrow();
            Instant set = events.moonset().orElseThrow();
            if (rise.isBefore(set)) {
                return !observedAt.isBefore(rise) && observedAt.isBefore(set);
            }
            return observedAt.isBefore(set) || !observedAt.isBefore(rise);
        }
        if (events.moonrise().isPresent()) {
            return !observedAt.isBefore(events.moonrise().orElseThrow());
        }
        if (events.moonset().isPresent()) {
            return observedAt.isBefore(events.moonset().orElseThrow());
        }
        throw new ObservationDataUnavailableException(
                "Normal lunar visibility requires a moonrise or moonset"
        );
    }
}
