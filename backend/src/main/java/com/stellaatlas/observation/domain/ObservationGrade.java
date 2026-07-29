package com.stellaatlas.observation.domain;

public enum ObservationGrade {
    EXCELLENT,
    GOOD,
    FAIR,
    POOR;

    public static ObservationGrade fromScore(int score) {
        if (score < 0 || score > 100) {
            throw new IllegalArgumentException("score must be between 0 and 100");
        }
        if (score >= 85) {
            return EXCELLENT;
        }
        if (score >= 70) {
            return GOOD;
        }
        if (score >= 50) {
            return FAIR;
        }
        return POOR;
    }
}
