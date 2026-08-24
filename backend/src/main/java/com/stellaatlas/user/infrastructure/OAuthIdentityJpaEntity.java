package com.stellaatlas.user.infrastructure;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "oauth_identity")
class OAuthIdentityJpaEntity {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private UserAccountJpaEntity userAccount;

    @Column(nullable = false, length = 50)
    private String provider;

    @Column(name = "provider_subject", nullable = false, length = 255)
    private String providerSubject;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected OAuthIdentityJpaEntity() {
    }

    OAuthIdentityJpaEntity(
            UUID id,
            UserAccountJpaEntity userAccount,
            String provider,
            String providerSubject,
            Instant createdAt
    ) {
        this.id = id;
        this.userAccount = userAccount;
        this.provider = provider;
        this.providerSubject = providerSubject;
        this.createdAt = createdAt;
    }

    UserAccountJpaEntity getUserAccount() {
        return userAccount;
    }
}
