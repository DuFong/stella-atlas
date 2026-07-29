package com.stellaatlas.astronomy.infrastructure;

import com.stellaatlas.astronomy.domain.AstronomyCalculationException;
import com.stellaatlas.astronomy.domain.AstronomyCalculator;
import com.stellaatlas.astronomy.domain.AstronomyConditions;
import com.stellaatlas.astronomy.domain.AstronomyQuery;
import com.stellaatlas.astronomy.domain.HorizonEvent;
import com.stellaatlas.astronomy.domain.LunarEvents;
import com.stellaatlas.astronomy.domain.LunarVisibility;
import com.stellaatlas.astronomy.domain.SolarEvents;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Optional;
import org.shredzone.commons.suncalc.MoonIllumination;
import org.shredzone.commons.suncalc.MoonTimes;
import org.shredzone.commons.suncalc.SunTimes;
import org.springframework.stereotype.Component;

@Component
public class CommonsSuncalcAstronomyCalculator implements AstronomyCalculator {

    @Override
    public AstronomyConditions calculate(AstronomyQuery query, ZoneId timeZone) {
        ZonedDateTime startOfDay = query.date().atStartOfDay(timeZone);
        Duration localDay = Duration.between(startOfDay, query.date().plusDays(1).atStartOfDay(timeZone));

        SolarEvents solarEvents = new SolarEvents(
                calculateSunset(query, startOfDay, localDay, SunTimes.Twilight.VISUAL),
                calculateSunset(query, startOfDay, localDay, SunTimes.Twilight.CIVIL),
                calculateSunset(query, startOfDay, localDay, SunTimes.Twilight.NAUTICAL),
                calculateSunset(query, startOfDay, localDay, SunTimes.Twilight.ASTRONOMICAL)
        );

        MoonTimes moonTimes = MoonTimes.compute()
                .on(startOfDay)
                .at(query.latitude(), query.longitude())
                .limit(localDay)
                .execute();
        ZonedDateTime representativeTime = query.date().atTime(12, 0).atZone(timeZone);
        MoonIllumination moonIllumination = MoonIllumination.compute()
                .on(representativeTime)
                .at(query.latitude(), query.longitude())
                .execute();

        LunarEvents lunarEvents = new LunarEvents(
                toInstant(moonTimes.getRise()),
                toInstant(moonTimes.getSet()),
                lunarVisibility(moonTimes),
                clampRatio((moonIllumination.getPhase() + 180.0) / 360.0),
                clampRatio(moonIllumination.getFraction())
        );
        return new AstronomyConditions(timeZone, solarEvents, lunarEvents);
    }

    private HorizonEvent calculateSunset(
            AstronomyQuery query,
            ZonedDateTime startOfDay,
            Duration localDay,
            SunTimes.Twilight twilight
    ) {
        SunTimes times = SunTimes.compute()
                .on(startOfDay)
                .at(query.latitude(), query.longitude())
                .limit(localDay)
                .twilight(twilight)
                .execute();
        if (times.getSet() != null) {
            return HorizonEvent.occursAt(times.getSet().toInstant());
        }
        if (times.isAlwaysUp()) {
            return HorizonEvent.alwaysAbove();
        }
        if (times.isAlwaysDown()) {
            return HorizonEvent.alwaysBelow();
        }
        throw new AstronomyCalculationException("Sun calculation did not produce a horizon state");
    }

    private LunarVisibility lunarVisibility(MoonTimes moonTimes) {
        if (moonTimes.isAlwaysUp()) {
            return LunarVisibility.ALWAYS_ABOVE;
        }
        if (moonTimes.isAlwaysDown()) {
            return LunarVisibility.ALWAYS_BELOW;
        }
        return LunarVisibility.NORMAL;
    }

    private Optional<Instant> toInstant(ZonedDateTime value) {
        return Optional.ofNullable(value).map(ZonedDateTime::toInstant);
    }

    private double clampRatio(double value) {
        return Math.clamp(value, 0.0, 1.0);
    }
}
