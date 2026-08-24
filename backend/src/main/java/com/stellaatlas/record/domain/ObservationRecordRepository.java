package com.stellaatlas.record.domain;

import java.util.List;
import java.util.UUID;

public interface ObservationRecordRepository {

    ObservationRecord save(ObservationRecord record);

    List<ObservationRecord> findAllByUserId(UUID userId);

    boolean deleteByIdAndUserId(UUID id, UUID userId);
}
