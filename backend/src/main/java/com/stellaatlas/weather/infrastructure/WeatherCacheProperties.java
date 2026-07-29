package com.stellaatlas.weather.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.time.Duration;
import java.util.Objects;

@ConfigurationProperties(prefix = "stellaatlas.weather.cache")
public record WeatherCacheProperties(
        Duration ttl,
        long maximumSize
) {
    public WeatherCacheProperties {
        Objects.requireNonNull(ttl, "ttl must not be null");
        if (ttl.isZero() || ttl.isNegative()) {
            throw new IllegalArgumentException("ttl must be positive");
        }
        if (maximumSize <= 0) {
            throw new IllegalArgumentException("maximumSize must be positive");
        }
    }
}
