import { getBackendApiUrl } from "@/lib/backend-api";
import type { RecentLocation } from "@/features/location/types/recent-location";

type RecentLocationResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number };

type CsrfToken = {
  headerName: "X-CSRF-TOKEN";
  token: string;
};

export async function getRecentLocations(
  cookieHeader: string,
): Promise<RecentLocationResult<RecentLocation[]>> {
  try {
    const response = await fetch(
      getBackendApiUrl("/api/v1/users/me/recent-locations"),
      {
        cache: "no-store",
        headers: requestHeaders(cookieHeader),
      },
    );
    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const payload: unknown = await response.json();
    return isRecentLocationList(payload)
      ? { ok: true, data: payload }
      : { ok: false, status: 502 };
  } catch {
    return { ok: false, status: 503 };
  }
}

export async function clearRecentLocations(
  cookieHeader: string,
): Promise<RecentLocationResult<null>> {
  const csrf = await getCsrfToken(cookieHeader);
  if (!csrf.ok) {
    return csrf;
  }

  try {
    const response = await fetch(
      getBackendApiUrl("/api/v1/users/me/recent-locations"),
      {
        method: "DELETE",
        cache: "no-store",
        headers: {
          ...requestHeaders(cookieHeader),
          [csrf.data.headerName]: csrf.data.token,
        },
      },
    );
    return response.status === 204
      ? { ok: true, data: null }
      : { ok: false, status: response.status };
  } catch {
    return { ok: false, status: 503 };
  }
}

async function getCsrfToken(
  cookieHeader: string,
): Promise<RecentLocationResult<CsrfToken>> {
  try {
    const response = await fetch(getBackendApiUrl("/api/v1/auth/csrf"), {
      cache: "no-store",
      headers: requestHeaders(cookieHeader),
    });
    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const payload: unknown = await response.json();
    return isCsrfToken(payload)
      ? { ok: true, data: payload }
      : { ok: false, status: 502 };
  } catch {
    return { ok: false, status: 503 };
  }
}

function requestHeaders(cookieHeader: string): Record<string, string> {
  return { Accept: "application/json", Cookie: cookieHeader };
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

function isRecentLocationList(payload: unknown): payload is RecentLocation[] {
  return Array.isArray(payload) && payload.every(isRecentLocation);
}

function isRecentLocation(payload: unknown): payload is RecentLocation {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const location = payload as Partial<RecentLocation>;
  return (
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    typeof location.timezone === "string" &&
    typeof location.lastQueriedAt === "string"
  );
}
