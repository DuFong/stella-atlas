package com.stellaatlas.observation.api;

import com.stellaatlas.observation.application.ObservationForecastService;
import com.stellaatlas.observation.domain.ObservationForecastQuery;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import java.time.LocalDate;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Validated
@RestController
@RequestMapping("/api/v1/observations")
public class ObservationController {

    private final ObservationForecastService service;
    private final ObservationResponseMapper mapper;

    public ObservationController(
            ObservationForecastService service,
            ObservationResponseMapper mapper
    ) {
        this.service = service;
        this.mapper = mapper;
    }

    @GetMapping
    public ObservationResponse getForecast(
            @RequestParam
            @DecimalMin(value = "-90.0", message = "must be between -90 and 90")
            @DecimalMax(value = "90.0", message = "must be between -90 and 90")
            double latitude,
            @RequestParam
            @DecimalMin(value = "-180.0", message = "must be between -180 and 180")
            @DecimalMax(value = "180.0", message = "must be between -180 and 180")
            double longitude,
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate date
    ) {
        return mapper.map(service.getForecast(
                new ObservationForecastQuery(latitude, longitude, date)
        ));
    }
}
