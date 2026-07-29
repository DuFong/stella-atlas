import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { ObservationForecast } from "../types/observation";
import { ObservationSummaryCard } from "./observation-summary-card";

describe("ObservationSummaryCard", () => {
  it("shows score, recommendation window, and representative conditions", () => {
    render(<ObservationSummaryCard forecast={forecast()} />);

    expect(
      screen.getByRole("article", { name: "관측 결과 요약" }),
    ).toHaveTextContent("90/ 100");
    expect(screen.getByText("매우 좋음")).toBeInTheDocument();
    expect(screen.getByText(/10:00 — .*12:00/)).toBeInTheDocument();
    expect(screen.getByText("평균 90점")).toBeInTheDocument();
    expect(screen.getByLabelText("주요 관측 조건")).toHaveTextContent("구름12%");
  });
});

function forecast(): ObservationForecast {
  const event = {
    time: "2026-08-01T19:40:00+09:00",
    state: "OCCURS" as const,
  };
  return {
    location: {
      latitude: 37.5665,
      longitude: 126.978,
      timezone: "Asia/Seoul",
    },
    date: "2026-08-01",
    summary: {
      score: 90,
      grade: "EXCELLENT",
      recommended: true,
      bestWindow: {
        start: "2026-08-01T22:00:00+09:00",
        end: "2026-08-02T00:00:00+09:00",
        averageScore: 90,
      },
      message: "별을 관측하기 매우 좋은 조건입니다.",
    },
    astronomy: {
      sunrise: event,
      sunset: event,
      civilTwilightStart: event,
      civilTwilightEnd: event,
      nauticalTwilightStart: event,
      nauticalTwilightEnd: event,
      astronomicalTwilightStart: event,
      astronomicalTwilightEnd: event,
      moonrise: null,
      moonset: null,
      lunarVisibility: "ALWAYS_BELOW",
      moonPhase: 0.1,
      moonIllumination: 0.2,
    },
    hourly: [
      {
        time: "2026-08-01T22:00:00+09:00",
        score: 90,
        grade: "EXCELLENT",
        recommended: true,
        twilightPhase: "DARK",
        moonAboveHorizon: false,
        weather: {
          temperatureCelsius: 24,
          cloudCoverPercent: 12,
          precipitationProbabilityPercent: 0,
          humidityPercent: 60,
          visibilityMeters: 18_000,
          windSpeedMetersPerSecond: 2,
        },
        reasons: [
          {
            code: "MODERATE_CLOUD_COVER",
            impact: -10,
            message: "구름이 조금 예상됩니다.",
          },
        ],
      },
    ],
    generatedAt: "2026-08-01T10:00:00Z",
  };
}
