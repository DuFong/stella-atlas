package com.stellaatlas.record.domain;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneId;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public record ObservationRecord(
        UUID id,
        UUID userId,
        Instant observedAt,
        ZoneId timezone,
        BigDecimal latitude,
        BigDecimal longitude,
        String comment,
        Instant createdAt
) {

    public static final int MAX_COMMENT_LENGTH = 500;
    private static final Pattern HASHTAG = Pattern.compile("(?U)(?<![\\p{L}\\p{N}_])#([\\p{L}\\p{N}_]+)");

    public ObservationRecord {
        Objects.requireNonNull(id, "Observation record id is required");
        Objects.requireNonNull(userId, "Observation record owner is required");
        Objects.requireNonNull(observedAt, "Observation time is required");
        Objects.requireNonNull(timezone, "Observation timezone is required");
        Objects.requireNonNull(comment, "Observation comment is required");
        Objects.requireNonNull(createdAt, "Observation record creation time is required");
        if ((latitude == null) != (longitude == null)) {
            throw new IllegalArgumentException("Observation coordinates must be provided together");
        }
        requireCoordinate(latitude, BigDecimal.valueOf(-90), BigDecimal.valueOf(90), "latitude");
        requireCoordinate(longitude, BigDecimal.valueOf(-180), BigDecimal.valueOf(180), "longitude");
        comment = comment.trim();
        if (comment.length() > MAX_COMMENT_LENGTH) {
            throw new IllegalArgumentException("Observation comment is too long");
        }
    }

    public List<String> hashtags() {
        LinkedHashSet<String> tags = new LinkedHashSet<>();
        Matcher matcher = HASHTAG.matcher(comment);
        while (matcher.find()) {
            tags.add(matcher.group(1).toLowerCase(Locale.ROOT));
        }
        return List.copyOf(tags);
    }

    private static void requireCoordinate(
            BigDecimal value,
            BigDecimal minimum,
            BigDecimal maximum,
            String field
    ) {
        if (value == null) {
            return;
        }
        if (value.scale() > 6 || value.compareTo(minimum) < 0 || value.compareTo(maximum) > 0) {
            throw new IllegalArgumentException("Observation " + field + " is invalid");
        }
    }
}
