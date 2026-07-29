package com.stellaatlas.astronomy.domain;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.util.Optional;
import org.junit.jupiter.api.Test;

class LunarEventsTest {

    @Test
    void shouldRejectPhaseAndIlluminationOutsideRatioRange() {
        assertThatThrownBy(() -> new LunarEvents(
                Optional.empty(), Optional.empty(), LunarVisibility.NORMAL, -0.01, 0.5
        )).isInstanceOf(IllegalArgumentException.class).hasMessageContaining("phase");
        assertThatThrownBy(() -> new LunarEvents(
                Optional.empty(), Optional.empty(), LunarVisibility.NORMAL, 0.5, 1.01
        )).isInstanceOf(IllegalArgumentException.class).hasMessageContaining("illumination");
    }
}
