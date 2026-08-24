package com.stellaatlas.user.domain;

import java.util.Optional;

public interface UserAccountRepository {

    Optional<UserAccount> findByIdentity(OAuthIdentity identity);

    UserAccount create(UserAccount userAccount, OAuthIdentity identity);

    UserAccount update(UserAccount userAccount);
}
