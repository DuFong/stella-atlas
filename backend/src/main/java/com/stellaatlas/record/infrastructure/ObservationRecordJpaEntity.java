package com.stellaatlas.record.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "observation_record")
class ObservationRecordJpaEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "observed_at", nullable = false)
    private Instant observedAt;

    @Column(nullable = false, length = 63)
    private String timezone;

    @Column(precision = 8, scale = 6)
    private BigDecimal latitude;

    @Column(precision = 9, scale = 6)
    private BigDecimal longitude;

    @Column(nullable = false, length = 500)
    private String comment;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected ObservationRecordJpaEntity() {
    }

    ObservationRecordJpaEntity(
            UUID id,
            UUID userId,
            Instant observedAt,
            String timezone,
            BigDecimal latitude,
            BigDecimal longitude,
            String comment,
            Instant createdAt
    ) {
        this.id = id;
        this.userId = userId;
        this.observedAt = observedAt;
        this.timezone = timezone;
        this.latitude = latitude;
        this.longitude = longitude;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    UUID getId() {
        return id;
    }

    UUID getUserId() {
        return userId;
    }

    Instant getObservedAt() {
        return observedAt;
    }

    String getTimezone() {
        return timezone;
    }

    BigDecimal getLatitude() {
        return latitude;
    }

    BigDecimal getLongitude() {
        return longitude;
    }

    String getComment() {
        return comment;
    }

    Instant getCreatedAt() {
        return createdAt;
    }
}
