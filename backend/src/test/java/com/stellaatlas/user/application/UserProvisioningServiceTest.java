package com.stellaatlas.user.application;

import static org.assertj.core.api.Assertions.assertThat;

import com.stellaatlas.user.domain.OAuthIdentity;
import com.stellaatlas.user.domain.UserAccount;
import com.stellaatlas.user.domain.UserAccountRepository;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class UserProvisioningServiceTest {

    private static final Instant NOW = Instant.parse("2026-08-24T03:00:00Z");

    private InMemoryUserAccountRepository repository;
    private UserProvisioningService service;

    @BeforeEach
    void setUp() {
        repository = new InMemoryUserAccountRepository();
        service = new UserProvisioningService(repository, Clock.fixed(NOW, ZoneOffset.UTC));
    }

    @Test
    void shouldCreateInternalUserForNewGoogleIdentity() {
        OAuthIdentity identity = new OAuthIdentity("google", "google-subject");

        UUID userId = service.connect(new OAuthUserProfile(
                identity,
                "Stella Observer",
                "observer@example.com",
                "https://example.com/profile.png"
        ));

        UserAccount saved = repository.findByIdentity(identity).orElseThrow();
        assertThat(saved.id()).isEqualTo(userId);
        assertThat(saved.displayName()).isEqualTo("Stella Observer");
        assertThat(saved.createdAt()).isEqualTo(NOW);
        assertThat(saved.updatedAt()).isEqualTo(NOW);
    }

    @Test
    void shouldReuseInternalUserAndRefreshProfileForKnownIdentity() {
        OAuthIdentity identity = new OAuthIdentity("google", "google-subject");
        UUID originalId = service.connect(new OAuthUserProfile(
                identity,
                "Old Name",
                "old@example.com",
                null
        ));

        UUID connectedId = service.connect(new OAuthUserProfile(
                identity,
                "Updated Name",
                "new@example.com",
                "https://example.com/new.png"
        ));

        UserAccount saved = repository.findByIdentity(identity).orElseThrow();
        assertThat(connectedId).isEqualTo(originalId);
        assertThat(saved.displayName()).isEqualTo("Updated Name");
        assertThat(saved.email()).isEqualTo("new@example.com");
        assertThat(saved.pictureUrl()).isEqualTo("https://example.com/new.png");
        assertThat(repository.size()).isEqualTo(1);
    }

    private static final class InMemoryUserAccountRepository implements UserAccountRepository {

        private final Map<OAuthIdentity, UserAccount> usersByIdentity = new HashMap<>();

        @Override
        public Optional<UserAccount> findByIdentity(OAuthIdentity identity) {
            return Optional.ofNullable(usersByIdentity.get(identity));
        }

        @Override
        public UserAccount create(UserAccount userAccount, OAuthIdentity identity) {
            usersByIdentity.put(identity, userAccount);
            return userAccount;
        }

        @Override
        public UserAccount update(UserAccount userAccount) {
            OAuthIdentity identity = usersByIdentity.entrySet().stream()
                    .filter(entry -> entry.getValue().id().equals(userAccount.id()))
                    .map(Map.Entry::getKey)
                    .findFirst()
                    .orElseThrow();
            usersByIdentity.put(identity, userAccount);
            return userAccount;
        }

        int size() {
            return usersByIdentity.size();
        }
    }
}
