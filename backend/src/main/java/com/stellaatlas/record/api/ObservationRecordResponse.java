package com.stellaatlas.record.api;

import com.stellaatlas.record.domain.ObservationRecord;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ObservationRecordResponse(
        UUID id,
        Instant observedAt,
        String timezone,
        BigDecimal latitude,
        BigDecimal longitude,
        String comment,
        List<String> hashtags,
        String mediaStatus,
        Instant createdAt
) {

    static ObservationRecordResponse from(ObservationRecord record) {
        return new ObservationRecordResponse(
                record.id(),
                record.observedAt(),
                record.timezone().getId(),
                record.latitude(),
                record.longitude(),
                record.comment(),
                record.hashtags(),
                "NOT_ATTACHED",
                record.createdAt()
        );
    }
}
