package com.stellaatlas.location.infrastructure;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataFavoriteLocationRepository extends JpaRepository<FavoriteLocationJpaEntity, UUID> {

    List<FavoriteLocationJpaEntity> findAllByUserIdOrderByCreatedAtAscIdAsc(UUID userId);

    Optional<FavoriteLocationJpaEntity> findByIdAndUserId(UUID id, UUID userId);

    long deleteByIdAndUserId(UUID id, UUID userId);
}
