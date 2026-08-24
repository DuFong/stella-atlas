package com.stellaatlas.user.application;

import com.stellaatlas.user.domain.OAuthIdentity;

public record OAuthUserProfile(
        OAuthIdentity identity,
        String displayName,
        String email,
        String pictureUrl
) {

    public OAuthUserProfile {
        if (identity == null) {
            throw new IllegalArgumentException("OAuth identity is required");
        }
    }
}
