package com.stellaatlas.user.application;

import com.stellaatlas.user.domain.UserAccount;
import com.stellaatlas.user.domain.UserAccountRepository;
import java.time.Clock;
import java.time.Instant;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProvisioningService {

    private final UserAccountRepository userAccounts;
    private final Clock clock;

    public UserProvisioningService(UserAccountRepository userAccounts, Clock clock) {
        this.userAccounts = userAccounts;
        this.clock = clock;
    }

    @Transactional
    public UUID connect(OAuthUserProfile profile) {
        Instant now = Instant.now(clock);

        return userAccounts.findByIdentity(profile.identity())
                .map(existing -> updateProfile(existing, profile, now))
                .orElseGet(() -> createUser(profile, now))
                .id();
    }

    private UserAccount createUser(OAuthUserProfile profile, Instant now) {
        UserAccount userAccount = new UserAccount(
                UUID.randomUUID(),
                profile.displayName(),
                profile.email(),
                profile.pictureUrl(),
                now,
                now
        );
        return userAccounts.create(userAccount, profile.identity());
    }

    private UserAccount updateProfile(UserAccount existing, OAuthUserProfile profile, Instant now) {
        UserAccount updated = existing.updateProfile(
                profile.displayName(),
                profile.email(),
                profile.pictureUrl(),
                now
        );
        return userAccounts.update(updated);
    }
}
