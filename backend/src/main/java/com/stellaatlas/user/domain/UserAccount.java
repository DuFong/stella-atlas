package com.stellaatlas.user.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

public record UserAccount(
        UUID id,
        String displayName,
        String email,
        String pictureUrl,
        Instant createdAt,
        Instant updatedAt
) {

    public UserAccount {
        Objects.requireNonNull(id, "User id is required");
        Objects.requireNonNull(createdAt, "User creation time is required");
        Objects.requireNonNull(updatedAt, "User update time is required");
        if (updatedAt.isBefore(createdAt)) {
            throw new IllegalArgumentException("User update time cannot precede creation time");
        }
    }

    public UserAccount updateProfile(
            String updatedDisplayName,
            String updatedEmail,
            String updatedPictureUrl,
            Instant updateTime
    ) {
        return new UserAccount(
                id,
                updatedDisplayName,
                updatedEmail,
                updatedPictureUrl,
                createdAt,
                updateTime
        );
    }
}
