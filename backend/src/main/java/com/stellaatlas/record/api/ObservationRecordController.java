package com.stellaatlas.record.api;

import com.stellaatlas.record.application.ObservationRecordService;
import com.stellaatlas.user.application.AuthenticatedUser;
import jakarta.validation.Valid;
import java.time.ZoneId;
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
@RequestMapping("/api/v1/users/me/records")
public class ObservationRecordController {

    private final ObservationRecordService service;

    public ObservationRecordController(ObservationRecordService service) {
        this.service = service;
    }

    @GetMapping
    List<ObservationRecordResponse> getAll(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user
    ) {
        return service.getAll(user.userId()).stream()
                .map(ObservationRecordResponse::from)
                .toList();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    ObservationRecordResponse create(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user,
            @Valid @RequestBody CreateObservationRecordRequest request
    ) {
        return ObservationRecordResponse.from(service.create(
                user.userId(),
                request.observedAt(),
                ZoneId.of(request.timezone()),
                request.latitude(),
                request.longitude(),
                request.comment()
        ));
    }

    @DeleteMapping("/{recordId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void delete(
            @AuthenticationPrincipal(errorOnInvalidType = true) AuthenticatedUser user,
            @PathVariable UUID recordId
    ) {
        service.delete(user.userId(), recordId);
    }
}
