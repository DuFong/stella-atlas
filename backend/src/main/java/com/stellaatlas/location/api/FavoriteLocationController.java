package com.stellaatlas.location.api;

import com.stellaatlas.location.application.FavoriteLocationService;
import com.stellaatlas.user.application.AuthenticatedUser;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users/me/locations")
public class FavoriteLocationController {

    private final FavoriteLocationService service;

    public FavoriteLocationController(FavoriteLocationService service) {
        this.service = service;
    }

    @GetMapping
    List<FavoriteLocationResponse> getAll(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user
    ) {
        return service.getAll(user.userId()).stream()
                .map(FavoriteLocationResponse::from)
                .toList();
    }

    @GetMapping("/{locationId}")
    FavoriteLocationResponse get(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user,
            @PathVariable UUID locationId
    ) {
        return FavoriteLocationResponse.from(service.get(user.userId(), locationId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    FavoriteLocationResponse create(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user,
            @Valid @RequestBody CreateFavoriteLocationRequest request
    ) {
        return FavoriteLocationResponse.from(service.create(
                user.userId(),
                request.name(),
                request.latitude(),
                request.longitude()
        ));
    }

    @DeleteMapping("/{locationId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user,
            @PathVariable UUID locationId
    ) {
        service.delete(user.userId(), locationId);
    }
}
