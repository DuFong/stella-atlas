package com.stellaatlas.user.api;

public record CsrfTokenResponse(
        String headerName,
        String token
) {
}
