package com.stellaatlas.record.infrastructure;

import com.stellaatlas.record.domain.ObservationRecord;
import com.stellaatlas.record.domain.ObservationRecordRepository;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class JpaObservationRecordRepository implements ObservationRecordRepository {

    private final SpringDataObservationRecordRepository repository;

    JpaObservationRecordRepository(SpringDataObservationRecordRepository repository) {
        this.repository = repository;
    }

    @Override
    public ObservationRecord save(ObservationRecord record) {
        return toDomain(repository.save(toEntity(record)));
    }

    @Override
    public List<ObservationRecord> findAllByUserId(UUID userId) {
        return repository.findAllByUserIdOrderByCreatedAtDescIdDesc(userId).stream()
                .map(JpaObservationRecordRepository::toDomain)
                .toList();
    }

    @Override
    public boolean deleteByIdAndUserId(UUID id, UUID userId) {
        return repository.deleteByIdAndUserId(id, userId) > 0;
    }

    private static ObservationRecordJpaEntity toEntity(ObservationRecord record) {
        return new ObservationRecordJpaEntity(
                record.id(),
                record.userId(),
                record.observedAt(),
                record.timezone().getId(),
                record.latitude(),
                record.longitude(),
                record.comment(),
                record.createdAt()
        );
    }

    private static ObservationRecord toDomain(ObservationRecordJpaEntity entity) {
        return new ObservationRecord(
                entity.getId(),
                entity.getUserId(),
                entity.getObservedAt(),
                ZoneId.of(entity.getTimezone()),
                entity.getLatitude(),
                entity.getLongitude(),
                entity.getComment(),
                entity.getCreatedAt()
        );
    }
}
