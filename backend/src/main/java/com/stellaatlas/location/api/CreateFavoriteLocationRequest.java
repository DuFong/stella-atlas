package com.stellaatlas.location.api;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateFavoriteLocationRequest(
        @NotBlank(message = "must not be blank")
        @Size(max = 100, message = "must be at most 100 characters")
        String name,
        @NotNull(message = "must not be null")
        @DecimalMin(value = "-90.0", message = "must be between -90 and 90")
        @DecimalMax(value = "90.0", message = "must be between -90 and 90")
        @Digits(integer = 2, fraction = 6, message = "must have at most 6 decimal places")
        BigDecimal latitude,
        @NotNull(message = "must not be null")
        @DecimalMin(value = "-180.0", message = "must be between -180 and 180")
        @DecimalMax(value = "180.0", message = "must be between -180 and 180")
        @Digits(integer = 3, fraction = 6, message = "must have at most 6 decimal places")
        BigDecimal longitude
) {
}
