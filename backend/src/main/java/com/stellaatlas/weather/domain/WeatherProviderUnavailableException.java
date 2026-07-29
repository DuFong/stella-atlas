package com.stellaatlas.weather.domain;

public class WeatherProviderUnavailableException extends RuntimeException {

    public WeatherProviderUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }
}
