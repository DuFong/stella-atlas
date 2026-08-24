package com.stellaatlas.location.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "recent_location")
class RecentLocationJpaEntity {

    @Id
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false, precision = 6, scale = 4)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 7, scale = 4)
    private BigDecimal longitude;

    @Column(nullable = false, length = 63)
    private String timezone;

    @Column(name = "last_queried_at", nullable = false)
    private Instant lastQueriedAt;

    protected RecentLocationJpaEntity() {
    }

    RecentLocationJpaEntity(
            UUID id,
            UUID userId,
            BigDecimal latitude,
            BigDecimal longitude,
            String timezone,
            Instant lastQueriedAt
    ) {
        this.id = id;
        this.userId = userId;
        this.latitude = latitude;
        this.longitude = longitude;
        this.timezone = timezone;
        this.lastQueriedAt = lastQueriedAt;
    }

    UUID getId() {
        return id;
    }

    UUID getUserId() {
        return userId;
    }

    BigDecimal getLatitude() {
        return latitude;
    }

    BigDecimal getLongitude() {
        return longitude;
    }

    String getTimezone() {
        return timezone;
    }

    Instant getLastQueriedAt() {
        return lastQueriedAt;
    }

    void refresh(String timezone, Instant lastQueriedAt) {
        this.timezone = timezone;
        this.lastQueriedAt = lastQueriedAt;
    }
}
