package com.stellaatlas.record.infrastructure;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataObservationRecordRepository
        extends JpaRepository<ObservationRecordJpaEntity, UUID> {

    List<ObservationRecordJpaEntity> findAllByUserIdOrderByCreatedAtDescIdDesc(UUID userId);

    long deleteByIdAndUserId(UUID id, UUID userId);
}
