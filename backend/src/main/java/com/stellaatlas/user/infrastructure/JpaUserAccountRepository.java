package com.stellaatlas.user.infrastructure;

import com.stellaatlas.user.domain.OAuthIdentity;
import com.stellaatlas.user.domain.UserAccount;
import com.stellaatlas.user.domain.UserAccountRepository;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class JpaUserAccountRepository implements UserAccountRepository {

    private final SpringDataUserAccountRepository userAccounts;
    private final SpringDataOAuthIdentityRepository identities;

    JpaUserAccountRepository(
            SpringDataUserAccountRepository userAccounts,
            SpringDataOAuthIdentityRepository identities
    ) {
        this.userAccounts = userAccounts;
        this.identities = identities;
    }

    @Override
    public Optional<UserAccount> findByIdentity(OAuthIdentity identity) {
        return identities.findByProviderAndProviderSubject(identity.provider(), identity.subject())
                .map(OAuthIdentityJpaEntity::getUserAccount)
                .map(JpaUserAccountRepository::toDomain);
    }

    @Override
    public UserAccount create(UserAccount userAccount, OAuthIdentity identity) {
        UserAccountJpaEntity savedUser = userAccounts.save(toEntity(userAccount));
        identities.save(new OAuthIdentityJpaEntity(
                UUID.randomUUID(),
                savedUser,
                identity.provider(),
                identity.subject(),
                userAccount.createdAt()
        ));
        return toDomain(savedUser);
    }

    @Override
    public UserAccount update(UserAccount userAccount) {
        UserAccountJpaEntity entity = userAccounts.findById(userAccount.id())
                .orElseThrow(() -> new IllegalStateException("Connected user account no longer exists"));
        entity.updateProfile(
                userAccount.displayName(),
                userAccount.email(),
                userAccount.pictureUrl(),
                userAccount.updatedAt()
        );
        return toDomain(userAccounts.save(entity));
    }

    private static UserAccountJpaEntity toEntity(UserAccount userAccount) {
        return new UserAccountJpaEntity(
                userAccount.id(),
                userAccount.displayName(),
                userAccount.email(),
                userAccount.pictureUrl(),
                userAccount.createdAt(),
                userAccount.updatedAt()
        );
    }

    private static UserAccount toDomain(UserAccountJpaEntity entity) {
        return new UserAccount(
                entity.getId(),
                entity.getDisplayName(),
                entity.getEmail(),
                entity.getPictureUrl(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
