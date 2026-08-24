package com.stellaatlas.location.domain;

import java.util.UUID;

public class FavoriteLocationNotFoundException extends RuntimeException {

    public FavoriteLocationNotFoundException(UUID locationId) {
        super("Favorite location not found: " + locationId);
    }
}
