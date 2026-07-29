package com.stellaatlas.location.domain;

public class TimeZoneResolutionException extends RuntimeException {

    public TimeZoneResolutionException(double latitude, double longitude) {
        super("Unable to resolve a time zone for coordinates: latitude=%s, longitude=%s"
                .formatted(latitude, longitude));
    }
}
