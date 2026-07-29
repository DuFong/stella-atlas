package com.stellaatlas.astronomy.domain;

import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

public record HorizonEvent(Optional<Instant> time, HorizonState state) {

    public HorizonEvent {
        time = Objects.requireNonNull(time, "time must not be null");
        state = Objects.requireNonNull(state, "state must not be null");
        if ((state == HorizonState.OCCURS) != time.isPresent()) {
            throw new IllegalArgumentException("an occurring horizon event must have exactly one time");
        }
    }

    public static HorizonEvent occursAt(Instant time) {
        return new HorizonEvent(Optional.of(Objects.requireNonNull(time)), HorizonState.OCCURS);
    }

    public static HorizonEvent alwaysAbove() {
        return new HorizonEvent(Optional.empty(), HorizonState.ALWAYS_ABOVE);
    }

    public static HorizonEvent alwaysBelow() {
        return new HorizonEvent(Optional.empty(), HorizonState.ALWAYS_BELOW);
    }
}
