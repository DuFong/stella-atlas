package com.stellaatlas.user.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "user_account")
class UserAccountJpaEntity {

    @Id
    private UUID id;

    @Column(name = "display_name", length = 200)
    private String displayName;

    @Column(length = 320)
    private String email;

    @Column(name = "picture_url")
    private String pictureUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected UserAccountJpaEntity() {
    }

    UserAccountJpaEntity(
            UUID id,
            String displayName,
            String email,
            String pictureUrl,
            Instant createdAt,
            Instant updatedAt
    ) {
        this.id = id;
        this.displayName = displayName;
        this.email = email;
        this.pictureUrl = pictureUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    UUID getId() {
        return id;
    }

    String getDisplayName() {
        return displayName;
    }

    String getEmail() {
        return email;
    }

    String getPictureUrl() {
        return pictureUrl;
    }

    Instant getCreatedAt() {
        return createdAt;
    }

    Instant getUpdatedAt() {
        return updatedAt;
    }

    void updateProfile(String displayName, String email, String pictureUrl, Instant updatedAt) {
        this.displayName = displayName;
        this.email = email;
        this.pictureUrl = pictureUrl;
        this.updatedAt = updatedAt;
    }
}
