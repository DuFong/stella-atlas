package com.stellaatlas.location.api;

import com.stellaatlas.location.application.RecentLocationService;
import com.stellaatlas.user.application.AuthenticatedUser;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/recent-locations")
public class RecentLocationController {

    private final RecentLocationService service;

    public RecentLocationController(RecentLocationService service) {
        this.service = service;
    }

    @GetMapping
    List<RecentLocationResponse> getAll(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user
    ) {
        return service.getAll(user.userId()).stream()
                .map(RecentLocationResponse::from)
                .toList();
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void clear(@AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user) {
        service.clear(user.userId());
    }
}
