package com.stellaatlas.user.domain;

import java.util.Locale;

public record OAuthIdentity(String provider, String subject) {

    public OAuthIdentity {
        if (provider == null || provider.isBlank()) {
            throw new IllegalArgumentException("OAuth provider is required");
        }
        if (subject == null || subject.isBlank()) {
            throw new IllegalArgumentException("OAuth provider subject is required");
        }
        provider = provider.trim().toLowerCase(Locale.ROOT);
        subject = subject.trim();
    }
}
