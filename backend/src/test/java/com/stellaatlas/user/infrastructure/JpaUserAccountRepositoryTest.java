package com.stellaatlas.user.infrastructure;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.user.domain.OAuthIdentity;
import com.stellaatlas.user.domain.UserAccount;
import com.stellaatlas.user.domain.UserAccountRepository;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Import;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(JpaUserAccountRepository.class)
@Testcontainers(disabledWithoutDocker = true)
class JpaUserAccountRepositoryTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:17-alpine");

    @Autowired
    private UserAccountRepository repository;

    @Test
    void shouldPersistAndResolveUserByProviderIdentity() {
        Instant createdAt = Instant.parse("2026-08-24T03:00:00Z");
        OAuthIdentity identity = new OAuthIdentity("google", "google-subject");
        UserAccount account = new UserAccount(
                UUID.randomUUID(),
                "Stella Observer",
                "observer@example.com",
                null,
                createdAt,
                createdAt
        );

        repository.create(account, identity);

        assertThat(repository.findByIdentity(identity)).contains(account);
    }

    @Test
    void shouldUpdateMutableProfileWithoutChangingInternalUserId() {
        Instant createdAt = Instant.parse("2026-08-24T03:00:00Z");
        OAuthIdentity identity = new OAuthIdentity("google", "google-subject");
        UserAccount original = new UserAccount(
                UUID.randomUUID(),
                "Old Name",
                "old@example.com",
                null,
                createdAt,
                createdAt
        );
        repository.create(original, identity);
        UserAccount updated = original.updateProfile(
                "Updated Name",
                "new@example.com",
                "https://example.com/profile.png",
                createdAt.plusSeconds(60)
        );

        repository.update(updated);

        UserAccount saved = repository.findByIdentity(identity).orElseThrow();
        assertThat(saved.id()).isEqualTo(original.id());
        assertThat(saved.displayName()).isEqualTo("Updated Name");
        assertThat(saved.email()).isEqualTo("new@example.com");
        assertThat(saved.updatedAt()).isEqualTo(createdAt.plusSeconds(60));
    }
}
