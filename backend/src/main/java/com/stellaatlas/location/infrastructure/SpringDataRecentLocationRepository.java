package com.stellaatlas.location.infrastructure;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataRecentLocationRepository extends JpaRepository<RecentLocationJpaEntity, UUID> {

    Optional<RecentLocationJpaEntity> findByUserIdAndLatitudeAndLongitude(
            UUID userId,
            BigDecimal latitude,
            BigDecimal longitude
    );

    List<RecentLocationJpaEntity> findAllByUserIdOrderByLastQueriedAtDescIdDesc(UUID userId);

    long deleteAllByUserId(UUID userId);
}
