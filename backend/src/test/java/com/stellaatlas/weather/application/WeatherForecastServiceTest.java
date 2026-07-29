package com.stellaatlas.weather.application;

import com.stellaatlas.weather.domain.HourlyWeatherCondition;
import com.stellaatlas.weather.domain.WeatherForecast;
import com.stellaatlas.weather.domain.WeatherForecastQuery;
import com.stellaatlas.weather.domain.WeatherProvider;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.test.context.junit.jupiter.SpringJUnitConfig;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

@SpringJUnitConfig(WeatherForecastServiceTest.CacheTestConfiguration.class)
class WeatherForecastServiceTest {

    @Autowired
    private WeatherForecastService service;

    @Autowired
    private CountingWeatherProvider provider;

    @Test
    void shouldCacheForecastForTheSameQuery() {
        WeatherForecastQuery query = new WeatherForecastQuery(
                37.5665,
                126.978,
                LocalDate.of(2026, 8, 1)
        );

        WeatherForecast first = service.getForecast(query);
        WeatherForecast second = service.getForecast(query);

        assertThat(second).isSameAs(first);
        assertThat(provider.invocations()).isEqualTo(1);
    }

    @Configuration
    @EnableCaching
    static class CacheTestConfiguration {

        @Bean
        CountingWeatherProvider weatherProvider() {
            return new CountingWeatherProvider();
        }

        @Bean
        WeatherForecastService weatherForecastService(
                WeatherProvider weatherProvider
        ) {
            return new WeatherForecastService(weatherProvider);
        }

        @Bean
        CacheManager cacheManager() {
            return new ConcurrentMapCacheManager("weatherForecasts");
        }
    }

    static class CountingWeatherProvider implements WeatherProvider {

        private final AtomicInteger invocations = new AtomicInteger();

        @Override
        public WeatherForecast getForecast(WeatherForecastQuery query) {
            invocations.incrementAndGet();
            return new WeatherForecast(
                    ZoneId.of("Asia/Seoul"),
                    List.of(new HourlyWeatherCondition(
                            Instant.parse("2026-08-01T13:00:00Z"),
                            23.4,
                            12,
                            0,
                            62,
                            18_000,
                            2.1
                    ))
            );
        }

        int invocations() {
            return invocations.get();
        }
    }
}
