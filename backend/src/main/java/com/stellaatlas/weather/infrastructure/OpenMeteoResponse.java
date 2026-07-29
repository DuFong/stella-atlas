package com.stellaatlas.weather.infrastructure;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@JsonIgnoreProperties(ignoreUnknown = true)
record OpenMeteoResponse(
        String timezone,
        OpenMeteoHourly hourly
) {
}

@JsonIgnoreProperties(ignoreUnknown = true)
record OpenMeteoHourly(
        List<Long> time,
        @JsonProperty("temperature_2m")
        List<Double> temperature,
        @JsonProperty("cloud_cover")
        List<Double> cloudCover,
        @JsonProperty("precipitation_probability")
        List<Double> precipitationProbability,
        @JsonProperty("relative_humidity_2m")
        List<Double> relativeHumidity,
        List<Double> visibility,
        @JsonProperty("wind_speed_10m")
        List<Double> windSpeed
) {
}
