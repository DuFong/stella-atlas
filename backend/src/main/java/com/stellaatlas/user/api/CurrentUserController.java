package com.stellaatlas.user.api;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me")
public class CurrentUserController {

    @GetMapping
    CurrentUserResponse getCurrentUser(@AuthenticationPrincipal OidcUser user) {
        return new CurrentUserResponse(
                user.getFullName(),
                user.getEmail(),
                user.getPicture()
        );
    }
}
