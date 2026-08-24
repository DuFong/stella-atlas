package com.stellaatlas.record.application;

import com.stellaatlas.record.domain.ObservationRecord;
import com.stellaatlas.record.domain.ObservationRecordNotFoundException;
import com.stellaatlas.record.domain.ObservationRecordRepository;
import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ObservationRecordService {

    private final ObservationRecordRepository records;
    private final Clock clock;

    public ObservationRecordService(ObservationRecordRepository records, Clock clock) {
        this.records = records;
        this.clock = clock;
    }

    @Transactional
    public ObservationRecord create(
            UUID userId,
            Instant observedAt,
            ZoneId timezone,
            BigDecimal latitude,
            BigDecimal longitude,
            String comment
    ) {
        return records.save(new ObservationRecord(
                UUID.randomUUID(),
                userId,
                observedAt,
                timezone,
                latitude,
                longitude,
                comment,
                clock.instant()
        ));
    }

    @Transactional(readOnly = true)
    public List<ObservationRecord> getAll(UUID userId) {
        return records.findAllByUserId(userId);
    }

    @Transactional
    public void delete(UUID userId, UUID recordId) {
        if (!records.deleteByIdAndUserId(recordId, userId)) {
            throw new ObservationRecordNotFoundException(recordId);
        }
    }
}
