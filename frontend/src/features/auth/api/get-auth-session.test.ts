import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthSession } from "./get-auth-session";

describe("getAuthSession", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("does not call the backend without a session cookie", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAuthSession("theme=night");

    expect(result).toEqual({ status: "anonymous" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards the session cookie and returns the current user", async () => {
    vi.stubEnv("API_BASE_URL", "http://localhost:8080");
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          name: "Stella Observer",
          email: "observer@example.com",
          pictureUrl: null,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await getAuthSession(
      "theme=night; JSESSIONID=session-value",
    );

    expect(result).toEqual({
      status: "authenticated",
      user: {
        name: "Stella Observer",
        email: "observer@example.com",
        pictureUrl: null,
      },
    });
    expect(fetchMock).toHaveBeenCalledWith(
      new URL("http://localhost:8080/api/v1/users/me"),
      expect.objectContaining({
        cache: "no-store",
        headers: expect.objectContaining({
          Cookie: "theme=night; JSESSIONID=session-value",
        }),
      }),
    );
  });

  it("returns the anonymous state when the backend rejects the session", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    await expect(getAuthSession("JSESSIONID=expired")).resolves.toEqual({
      status: "anonymous",
    });
  });
});
