package com.stellaatlas.user.api;

public record CurrentUserResponse(
        String name,
        String email,
        String pictureUrl
) {
}
