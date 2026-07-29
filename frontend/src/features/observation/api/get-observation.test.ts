import { afterEach, describe, expect, it, vi } from "vitest";
import { getObservation } from "./get-observation";

const query = {
  latitude: "37.5665",
  longitude: "126.978",
  date: "2026-08-01",
};

describe("getObservation", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("requests the composed backend observation endpoint without caching", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
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
            bestWindow: null,
            message: "별을 관측하기 매우 좋은 조건입니다.",
          },
          astronomy: {
            moonIllumination: 0.2,
          },
          hourly: [],
          generatedAt: "2026-08-01T10:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getObservation(query);

    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(
      new URL(
        "http://localhost:8080/api/v1/observations?latitude=37.5665&longitude=126.978&date=2026-08-01",
      ),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("returns the safe backend error contract for expected failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            code: "WEATHER_PROVIDER_UNAVAILABLE",
            message: "날씨 정보를 일시적으로 불러올 수 없습니다.",
          }),
          { status: 503, headers: { "Content-Type": "application/json" } },
        ),
      ),
    );

    const result = await getObservation(query);

    expect(result).toEqual({
      ok: false,
      error: {
        code: "WEATHER_PROVIDER_UNAVAILABLE",
        message: "날씨 정보를 일시적으로 불러올 수 없습니다.",
      },
    });
  });

  it("does not expose connection failure details", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("connect ECONNREFUSED 127.0.0.1")),
    );

    const result = await getObservation(query);

    expect(result).toEqual({
      ok: false,
      error: {
        code: "API_UNAVAILABLE",
        message: "관측 API에 연결할 수 없습니다.",
      },
    });
  });
});
