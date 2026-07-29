package com.stellaatlas.weather.infrastructure;

import com.stellaatlas.weather.domain.WeatherForecast;
import com.stellaatlas.weather.domain.WeatherForecastQuery;
import com.stellaatlas.weather.domain.WeatherProviderResponseException;
import com.stellaatlas.weather.domain.WeatherProviderUnavailableException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.springframework.test.web.client.ExpectedCount.once;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.method;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.queryParam;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withStatus;
import static org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess;

class OpenMeteoWeatherAdapterTest {

    private static final WeatherForecastQuery QUERY =
            new WeatherForecastQuery(
                    37.5665,
                    126.9780,
                    LocalDate.of(2026, 8, 1)
            );

    private MockRestServiceServer server;
    private OpenMeteoWeatherAdapter adapter;

    @BeforeEach
    void setUp() {
        RestClient.Builder builder = RestClient.builder()
                .baseUrl("https://weather.example");
        server = MockRestServiceServer.bindTo(builder).build();
        adapter = new OpenMeteoWeatherAdapter(builder.build());
    }

    @Test
    void shouldMapHourlyForecastIntoDomainModel() {
        server.expect(once(), method(HttpMethod.GET))
                .andExpect(queryParam("latitude", "37.5665"))
                .andExpect(queryParam("longitude", "126.978"))
                .andExpect(queryParam("start_date", "2026-08-01"))
                .andExpect(queryParam("end_date", "2026-08-01"))
                .andExpect(queryParam("wind_speed_unit", "ms"))
                .andExpect(queryParam("timeformat", "unixtime"))
                .andExpect(queryParam("timezone", "auto"))
                .andRespond(withSuccess(validResponse(), MediaType.APPLICATION_JSON));

        WeatherForecast forecast = adapter.getForecast(QUERY);

        assertThat(forecast.timezone()).isEqualTo(ZoneId.of("Asia/Seoul"));
        assertThat(forecast.hourly()).hasSize(2);
        assertThat(forecast.hourly().getFirst().forecastAt())
                .isEqualTo(Instant.parse("2026-07-31T15:00:00Z"));
        assertThat(forecast.hourly().getFirst().temperatureCelsius())
                .isEqualTo(23.4);
        assertThat(forecast.hourly().getFirst().cloudCoverPercent())
                .isEqualTo(12);
        assertThat(forecast.hourly().getFirst().windSpeedMetersPerSecond())
                .isEqualTo(2.1);
        server.verify();
    }

    @Test
    void shouldRejectHourlyArraysWithDifferentLengths() {
        server.expect(once(), method(HttpMethod.GET))
                .andRespond(withSuccess("""
                        {
                          "timezone": "Asia/Seoul",
                          "hourly": {
                            "time": [1785510000, 1785513600],
                            "temperature_2m": [23.4],
                            "cloud_cover": [12, 15],
                            "precipitation_probability": [0, 5],
                            "relative_humidity_2m": [62, 64],
                            "visibility": [18000, 17000],
                            "wind_speed_10m": [2.1, 2.4]
                          }
                        }
                        """, MediaType.APPLICATION_JSON));

        assertThatThrownBy(() -> adapter.getForecast(QUERY))
                .isInstanceOf(WeatherProviderResponseException.class)
                .hasMessageContaining("inconsistent lengths");
    }

    @Test
    void shouldTranslateServerFailureToUnavailableException() {
        server.expect(once(), method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));

        assertThatThrownBy(() -> adapter.getForecast(QUERY))
                .isInstanceOf(WeatherProviderUnavailableException.class)
                .hasMessage("Open-Meteo is temporarily unavailable");
    }

    @Test
    void shouldTranslateRejectedRequestToResponseException() {
        server.expect(once(), method(HttpMethod.GET))
                .andRespond(withStatus(HttpStatus.BAD_REQUEST));

        assertThatThrownBy(() -> adapter.getForecast(QUERY))
                .isInstanceOf(WeatherProviderResponseException.class)
                .hasMessage("Open-Meteo rejected the forecast request");
    }

    private static String validResponse() {
        return """
                {
                  "latitude": 37.55,
                  "longitude": 127.0,
                  "timezone": "Asia/Seoul",
                  "hourly": {
                    "time": [1785510000, 1785513600],
                    "temperature_2m": [23.4, 22.8],
                    "cloud_cover": [12, 15],
                    "precipitation_probability": [0, 5],
                    "relative_humidity_2m": [62, 64],
                    "visibility": [18000, 17000],
                    "wind_speed_10m": [2.1, 2.4]
                  }
                }
                """;
    }
}
