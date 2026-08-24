import { afterEach, describe, expect, it, vi } from "vitest";
import { clearRecentLocations, getRecentLocations } from "./recent-locations";

const location = {
  latitude: 37.5665,
  longitude: 126.978,
  timezone: "Asia/Seoul",
  lastQueriedAt: "2026-08-24T04:00:00Z",
};

describe("recent location API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("forwards the session cookie when listing locations", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([location]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getRecentLocations("JSESSIONID=session-value");

    expect(result).toEqual({ ok: true, data: [location] });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:8080/api/v1/users/me/recent-locations"),
      expect.objectContaining({
        headers: expect.objectContaining({ Cookie: "JSESSIONID=session-value" }),
      }),
    );
  });

  it("uses a backend CSRF token when clearing locations", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ headerName: "X-CSRF-TOKEN", token: "csrf-value" }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await clearRecentLocations("JSESSIONID=session-value");

    expect(result).toEqual({ ok: true, data: null });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL("http://localhost:8080/api/v1/users/me/recent-locations"),
      expect.objectContaining({
        method: "DELETE",
        headers: expect.objectContaining({
          Cookie: "JSESSIONID=session-value",
          "X-CSRF-TOKEN": "csrf-value",
        }),
      }),
    );
  });
});
