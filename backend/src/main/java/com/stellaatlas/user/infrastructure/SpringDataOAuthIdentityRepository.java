package com.stellaatlas.user.infrastructure;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

interface SpringDataOAuthIdentityRepository extends JpaRepository<OAuthIdentityJpaEntity, UUID> {

    @EntityGraph(attributePaths = "userAccount")
    Optional<OAuthIdentityJpaEntity> findByProviderAndProviderSubject(String provider, String providerSubject);
}
