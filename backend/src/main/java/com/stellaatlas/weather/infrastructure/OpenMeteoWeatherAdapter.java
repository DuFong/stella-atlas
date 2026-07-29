package com.stellaatlas.weather.infrastructure;

import com.stellaatlas.weather.domain.HourlyWeatherCondition;
import com.stellaatlas.weather.domain.WeatherForecast;
import com.stellaatlas.weather.domain.WeatherForecastQuery;
import com.stellaatlas.weather.domain.WeatherProvider;
import com.stellaatlas.weather.domain.WeatherProviderResponseException;
import com.stellaatlas.weather.domain.WeatherProviderUnavailableException;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Component;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

import java.time.Instant;
import java.time.ZoneId;
import java.time.zone.ZoneRulesException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Component
class OpenMeteoWeatherAdapter implements WeatherProvider {

    private static final String HOURLY_VARIABLES = String.join(",",
            "temperature_2m",
            "cloud_cover",
            "precipitation_probability",
            "relative_humidity_2m",
            "visibility",
            "wind_speed_10m"
    );

    private final RestClient restClient;

    OpenMeteoWeatherAdapter(
            @Qualifier("openMeteoRestClient") RestClient restClient
    ) {
        this.restClient = restClient;
    }

    @Override
    public WeatherForecast getForecast(WeatherForecastQuery query) {
        try {
            OpenMeteoResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/v1/forecast")
                            .queryParam("latitude", query.latitude())
                            .queryParam("longitude", query.longitude())
                            .queryParam("start_date", query.date())
                            .queryParam("end_date", query.date())
                            .queryParam("hourly", HOURLY_VARIABLES)
                            .queryParam("temperature_unit", "celsius")
                            .queryParam("wind_speed_unit", "ms")
                            .queryParam("timeformat", "unixtime")
                            .queryParam("timezone", "auto")
                            .build())
                    .retrieve()
                    .body(OpenMeteoResponse.class);

            return mapResponse(response);
        } catch (WeatherProviderResponseException exception) {
            throw exception;
        } catch (ResourceAccessException exception) {
            throw new WeatherProviderUnavailableException(
                    "Open-Meteo request could not be completed",
                    exception
            );
        } catch (RestClientResponseException exception) {
            throw mapHttpFailure(exception);
        } catch (RestClientException exception) {
            throw new WeatherProviderResponseException(
                    "Open-Meteo response could not be processed",
                    exception
            );
        }
    }

    private WeatherForecast mapResponse(OpenMeteoResponse response) {
        if (response == null || response.hourly() == null) {
            throw invalidResponse("hourly forecast is missing");
        }

        ZoneId timezone = parseTimezone(response.timezone());
        OpenMeteoHourly hourly = response.hourly();
        int size = validateArraySizes(hourly);
        List<HourlyWeatherCondition> conditions = new ArrayList<>(size);

        for (int index = 0; index < size; index++) {
            try {
                conditions.add(new HourlyWeatherCondition(
                        Instant.ofEpochSecond(value(hourly.time(), index, "time")),
                        value(hourly.temperature(), index, "temperature_2m"),
                        value(hourly.cloudCover(), index, "cloud_cover"),
                        value(hourly.precipitationProbability(), index,
                                "precipitation_probability"),
                        value(hourly.relativeHumidity(), index,
                                "relative_humidity_2m"),
                        value(hourly.visibility(), index, "visibility"),
                        value(hourly.windSpeed(), index, "wind_speed_10m")
                ));
            } catch (IllegalArgumentException exception) {
                throw new WeatherProviderResponseException(
                        "Open-Meteo hourly value is invalid at index " + index,
                        exception
                );
            }
        }

        return new WeatherForecast(timezone, conditions);
    }

    private static ZoneId parseTimezone(String timezone) {
        try {
            return ZoneId.of(Objects.requireNonNull(timezone));
        } catch (NullPointerException | ZoneRulesException exception) {
            throw new WeatherProviderResponseException(
                    "Open-Meteo timezone is missing or invalid",
                    exception
            );
        }
    }

    private static int validateArraySizes(OpenMeteoHourly hourly) {
        List<List<?>> arrays = new ArrayList<>();
        arrays.add(hourly.time());
        arrays.add(hourly.temperature());
        arrays.add(hourly.cloudCover());
        arrays.add(hourly.precipitationProbability());
        arrays.add(hourly.relativeHumidity());
        arrays.add(hourly.visibility());
        arrays.add(hourly.windSpeed());

        if (arrays.stream().anyMatch(Objects::isNull)) {
            throw invalidResponse("one or more hourly variables are missing");
        }

        int size = arrays.getFirst().size();
        if (size == 0 || arrays.stream().anyMatch(values -> values.size() != size)) {
            throw invalidResponse("hourly variables have inconsistent lengths");
        }
        return size;
    }

    private static <T> T value(List<T> values, int index, String name) {
        T value = values.get(index);
        if (value == null) {
            throw invalidResponse(name + " contains a null value");
        }
        return value;
    }

    private static RuntimeException mapHttpFailure(
            RestClientResponseException exception
    ) {
        HttpStatusCode status = exception.getStatusCode();
        if (status.is5xxServerError() || status.value() == 429) {
            return new WeatherProviderUnavailableException(
                    "Open-Meteo is temporarily unavailable",
                    exception
            );
        }
        return new WeatherProviderResponseException(
                "Open-Meteo rejected the forecast request",
                exception
        );
    }

    private static WeatherProviderResponseException invalidResponse(
            String reason
    ) {
        return new WeatherProviderResponseException(
                "Invalid Open-Meteo response: " + reason
        );
    }
}
