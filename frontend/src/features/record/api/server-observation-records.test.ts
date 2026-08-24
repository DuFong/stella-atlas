import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createServerObservationRecord,
  getServerObservationRecords,
} from "./server-observation-records";

const record = {
  id: "40000000-0000-0000-0000-000000000004",
  observedAt: "2026-08-24T12:00:00Z",
  timezone: "Asia/Seoul",
  latitude: 37.5665,
  longitude: 126.978,
  comment: "맑은 하늘 #서울",
  hashtags: ["서울"],
  mediaStatus: "NOT_ATTACHED",
  createdAt: "2026-08-24T13:00:00Z",
} as const;

describe("server observation record API", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("lists records with the current session", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify([record]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    expect(await getServerObservationRecords("JSESSIONID=session-value"))
      .toEqual({ ok: true, data: [record] });
  });

  it("uses CSRF protection when creating metadata", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(
        JSON.stringify({ headerName: "X-CSRF-TOKEN", token: "csrf-value" }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ))
      .mockResolvedValueOnce(new Response(JSON.stringify(record), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await createServerObservationRecord("JSESSIONID=session-value", {
      observedAt: record.observedAt,
      timezone: record.timezone,
      latitude: record.latitude,
      longitude: record.longitude,
      comment: record.comment,
    });

    expect(result).toEqual({ ok: true, data: record });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL("http://localhost:8080/api/v1/users/me/records"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ "X-CSRF-TOKEN": "csrf-value" }),
      }),
    );
  });
});
