package com.stellaatlas.weather.domain;

public interface WeatherProvider {

    WeatherForecast getForecast(WeatherForecastQuery query);
}
