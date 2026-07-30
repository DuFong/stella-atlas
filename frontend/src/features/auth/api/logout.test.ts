import { afterEach, describe, expect, it, vi } from "vitest";
import { logout } from "./logout";

describe("logout", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it("uses the backend CSRF token to end the session", async () => {
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

    const result = await logout("JSESSIONID=session-value");

    expect(result).toBe(true);
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL("http://localhost:8080/api/v1/auth/logout"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Cookie: "JSESSIONID=session-value",
          "X-CSRF-TOKEN": "csrf-value",
        }),
      }),
    );
  });

  it("does not send logout when the CSRF response is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ token: "missing-header" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    await expect(logout("JSESSIONID=session-value")).resolves.toBe(false);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
