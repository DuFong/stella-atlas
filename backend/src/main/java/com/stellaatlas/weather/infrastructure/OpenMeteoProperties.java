package com.stellaatlas.weather.infrastructure;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.net.URI;
import java.time.Duration;
import java.util.Objects;

@ConfigurationProperties(prefix = "stellaatlas.weather.open-meteo")
public record OpenMeteoProperties(
        URI baseUrl,
        Duration connectTimeout,
        Duration readTimeout
) {
    public OpenMeteoProperties {
        Objects.requireNonNull(baseUrl, "baseUrl must not be null");
        requireHttpUri(baseUrl);
        requirePositive(connectTimeout, "connectTimeout");
        requirePositive(readTimeout, "readTimeout");
    }

    private static void requireHttpUri(URI uri) {
        if (!"http".equalsIgnoreCase(uri.getScheme())
                && !"https".equalsIgnoreCase(uri.getScheme())) {
            throw new IllegalArgumentException("baseUrl must use http or https");
        }
    }

    private static void requirePositive(Duration duration, String name) {
        Objects.requireNonNull(duration, name + " must not be null");
        if (duration.isZero() || duration.isNegative()) {
            throw new IllegalArgumentException(name + " must be positive");
        }
    }
}
