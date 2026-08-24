package com.stellaatlas.user.infrastructure;

import com.stellaatlas.user.application.OAuthUserProfile;
import com.stellaatlas.user.application.UserProvisioningService;
import com.stellaatlas.user.domain.OAuthIdentity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;

@Component
public class GoogleOidcUserService {

    private final UserProvisioningService userProvisioning;
    private final OidcUserService delegate;

    @Autowired
    public GoogleOidcUserService(UserProvisioningService userProvisioning) {
        this(userProvisioning, new OidcUserService());
    }

    GoogleOidcUserService(UserProvisioningService userProvisioning, OidcUserService delegate) {
        this.userProvisioning = userProvisioning;
        this.delegate = delegate;
    }

    public OidcUser loadUser(OidcUserRequest request) {
        OidcUser oidcUser = delegate.loadUser(request);
        String provider = request.getClientRegistration().getRegistrationId();
        var userId = userProvisioning.connect(new OAuthUserProfile(
                new OAuthIdentity(provider, oidcUser.getSubject()),
                oidcUser.getFullName(),
                oidcUser.getEmail(),
                oidcUser.getPicture()
        ));
        return new AuthenticatedOidcUser(userId, oidcUser);
    }
}
