package com.stellaatlas.record.domain;

import java.util.UUID;

public class ObservationRecordNotFoundException extends RuntimeException {

    public ObservationRecordNotFoundException(UUID recordId) {
        super("Observation record not found: " + recordId);
    }
}
