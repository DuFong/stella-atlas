package com.stellaatlas.observation.domain;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class BestObservationWindowSelector {

    private static final Duration SLOT_DURATION = Duration.ofHours(1);

    public Optional<ObservationWindow> select(List<HourlyObservation> observations) {
        List<HourlyObservation> sorted = observations.stream()
                .sorted(Comparator.comparing(HourlyObservation::observedAt))
                .toList();
        List<List<HourlyObservation>> candidates = contiguousRecommendedWindows(sorted);

        return candidates.stream()
                .map(this::toWindow)
                .sorted(Comparator.comparingInt(ObservationWindow::averageScore).reversed()
                        .thenComparing(
                                window -> Duration.between(window.start(), window.end()),
                                Comparator.reverseOrder()
                        )
                        .thenComparing(ObservationWindow::start))
                .findFirst();
    }

    private List<List<HourlyObservation>> contiguousRecommendedWindows(
            List<HourlyObservation> observations
    ) {
        List<List<HourlyObservation>> candidates = new ArrayList<>();
        List<HourlyObservation> current = new ArrayList<>();

        for (HourlyObservation observation : observations) {
            if (!observation.evaluation().recommended()) {
                addCandidate(candidates, current);
                current = new ArrayList<>();
                continue;
            }
            if (!current.isEmpty()
                    && !current.getLast().observedAt().plus(SLOT_DURATION)
                    .equals(observation.observedAt())) {
                addCandidate(candidates, current);
                current = new ArrayList<>();
            }
            current.add(observation);
        }
        addCandidate(candidates, current);
        return candidates;
    }

    private void addCandidate(
            List<List<HourlyObservation>> candidates,
            List<HourlyObservation> candidate
    ) {
        if (!candidate.isEmpty()) {
            candidates.add(List.copyOf(candidate));
        }
    }

    private ObservationWindow toWindow(List<HourlyObservation> observations) {
        int averageScore = (int) Math.round(observations.stream()
                .mapToInt(observation -> observation.evaluation().score())
                .average()
                .orElseThrow());
        return new ObservationWindow(
                observations.getFirst().observedAt(),
                observations.getLast().observedAt().plus(SLOT_DURATION),
                averageScore
        );
    }
}
