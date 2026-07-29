package com.stellaatlas.location.infrastructure;

import com.stellaatlas.location.domain.TimeZoneResolutionException;
import com.stellaatlas.location.domain.TimeZoneResolver;
import java.time.ZoneId;
import java.util.Comparator;
import net.iakovlev.timeshape.TimeZoneEngine;
import org.springframework.stereotype.Component;

@Component
public class TimeshapeTimeZoneResolver implements TimeZoneResolver {

    private final TimeZoneEngine engine;

    public TimeshapeTimeZoneResolver(TimeZoneEngine engine) {
        this.engine = engine;
    }

    @Override
    public ZoneId resolve(double latitude, double longitude) {
        return engine.queryAll(latitude, longitude).stream()
                .min(Comparator.comparing(ZoneId::getId))
                .orElseThrow(() -> new TimeZoneResolutionException(latitude, longitude));
    }
}
