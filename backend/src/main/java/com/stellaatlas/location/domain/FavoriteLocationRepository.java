package com.stellaatlas.location.domain;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoriteLocationRepository {

    FavoriteLocation save(FavoriteLocation location);

    List<FavoriteLocation> findAllByUserId(UUID userId);

    Optional<FavoriteLocation> findByIdAndUserId(UUID locationId, UUID userId);

    boolean deleteByIdAndUserId(UUID locationId, UUID userId);
}
