package com.stellaatlas.weather.application;

import com.stellaatlas.weather.domain.WeatherForecast;
import com.stellaatlas.weather.domain.WeatherForecastQuery;
import com.stellaatlas.weather.domain.WeatherProvider;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

@Service
public class WeatherForecastService {

    private final WeatherProvider weatherProvider;

    public WeatherForecastService(WeatherProvider weatherProvider) {
        this.weatherProvider = weatherProvider;
    }

    @Cacheable(cacheNames = "weatherForecasts", key = "#query")
    public WeatherForecast getForecast(WeatherForecastQuery query) {
        return weatherProvider.getForecast(query);
    }
}
