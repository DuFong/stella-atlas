package com.stellaatlas.weather.domain;

public class WeatherProviderResponseException extends RuntimeException {

    public WeatherProviderResponseException(String message) {
        super(message);
    }

    public WeatherProviderResponseException(String message, Throwable cause) {
        super(message, cause);
    }
}
