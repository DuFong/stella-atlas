package com.stellaatlas.location.domain;

import java.time.ZoneId;

public interface TimeZoneResolver {

    ZoneId resolve(double latitude, double longitude);
}
