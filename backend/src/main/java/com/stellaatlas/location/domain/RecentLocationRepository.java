package com.stellaatlas.location.domain;

import java.util.List;
import java.util.UUID;

public interface RecentLocationRepository {

    RecentLocation saveOrUpdate(RecentLocation location);

    List<RecentLocation> findAllByUserId(UUID userId);

    void retainNewest(UUID userId, int limit);

    void deleteAllByUserId(UUID userId);
}
