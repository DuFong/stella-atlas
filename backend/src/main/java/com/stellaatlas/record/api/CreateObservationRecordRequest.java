package com.stellaatlas.record.api;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.Instant;
import java.time.ZoneId;

public record CreateObservationRecordRequest(
        @NotNull Instant observedAt,
        @NotBlank @Size(max = 63) String timezone,
        @DecimalMin("-90") @DecimalMax("90") @Digits(integer = 2, fraction = 6)
        BigDecimal latitude,
        @DecimalMin("-180") @DecimalMax("180") @Digits(integer = 3, fraction = 6)
        BigDecimal longitude,
        @NotNull @Size(max = 500) String comment
) {

    @AssertTrue(message = "latitude and longitude must be provided together")
    public boolean isCoordinatePairValid() {
        return (latitude == null) == (longitude == null);
    }

    @AssertTrue(message = "timezone must be a valid IANA time zone")
    public boolean isTimezoneValid() {
        if (timezone == null || timezone.isBlank()) {
            return true;
        }
        try {
            ZoneId.of(timezone);
            return true;
        } catch (DateTimeException exception) {
            return false;
        }
    }
}
