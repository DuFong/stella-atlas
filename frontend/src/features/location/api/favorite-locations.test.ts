import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createFavoriteLocation,
  deleteFavoriteLocation,
  getFavoriteLocations,
} from "./favorite-locations";

const location = {
  id: "30000000-0000-0000-0000-000000000003",
  name: "서울 천문대",
  latitude: 37.5665,
  longitude: 126.978,
  timezone: "Asia/Seoul",
  createdAt: "2026-08-24T04:00:00Z",
};

describe("favorite location API", () => {
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

    const result = await getFavoriteLocations("JSESSIONID=session-value");

    expect(result).toEqual({ ok: true, data: [location] });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:8080/api/v1/users/me/locations"),
      expect.objectContaining({
        headers: expect.objectContaining({
          Cookie: "JSESSIONID=session-value",
        }),
      }),
    );
  });

  it("uses a backend CSRF token when creating a location", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            headerName: "X-CSRF-TOKEN",
            token: "csrf-value",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(
        new Response(JSON.stringify(location), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await createFavoriteLocation("JSESSIONID=session-value", {
      name: "서울 천문대",
      latitude: 37.5665,
      longitude: 126.978,
    });

    expect(result).toEqual({ ok: true, data: location });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL("http://localhost:8080/api/v1/users/me/locations"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Cookie: "JSESSIONID=session-value",
          "X-CSRF-TOKEN": "csrf-value",
        }),
      }),
    );
  });

  it("uses a backend CSRF token when deleting a location", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            headerName: "X-CSRF-TOKEN",
            token: "csrf-value",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      )
      .mockResolvedValueOnce(new Response(null, { status: 204 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await deleteFavoriteLocation(
      "JSESSIONID=session-value",
      location.id,
    );

    expect(result).toEqual({ ok: true, data: null });
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(
        `http://localhost:8080/api/v1/users/me/locations/${location.id}`,
      ),
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
