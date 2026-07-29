import { getBackendApiUrl } from "@/lib/backend-api";

type CsrfToken = {
  headerName: string;
  token: string;
};

export async function logout(cookieHeader: string): Promise<boolean> {
  if (!cookieHeader) {
    return true;
  }

  try {
    const csrfResponse = await fetch(getBackendApiUrl("/api/v1/auth/csrf"), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
    });
    if (!csrfResponse.ok) {
      return false;
    }

    const payload: unknown = await csrfResponse.json();
    if (!isCsrfToken(payload)) {
      return false;
    }

    const logoutResponse = await fetch(
      getBackendApiUrl("/api/v1/auth/logout"),
      {
        method: "POST",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Cookie: cookieHeader,
          [payload.headerName]: payload.token,
        },
      },
    );
    return logoutResponse.status === 204;
  } catch {
    return false;
  }
}

function isCsrfToken(payload: unknown): payload is CsrfToken {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const token = payload as Partial<CsrfToken>;
  return (
    token.headerName === "X-CSRF-TOKEN" &&
    typeof token.token === "string" &&
    token.token.length > 0
  );
}
