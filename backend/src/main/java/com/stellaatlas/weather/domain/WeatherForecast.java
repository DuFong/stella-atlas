package com.stellaatlas.weather.domain;

import java.time.ZoneId;
import java.util.List;
import java.util.Objects;

public record WeatherForecast(
        ZoneId timezone,
        List<HourlyWeatherCondition> hourly
) {
    public WeatherForecast {
        Objects.requireNonNull(timezone, "timezone must not be null");
        hourly = List.copyOf(Objects.requireNonNull(hourly, "hourly must not be null"));
        if (hourly.isEmpty()) {
            throw new IllegalArgumentException("hourly must not be empty");
        }
    }
}
