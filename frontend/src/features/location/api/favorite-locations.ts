import { getBackendApiUrl } from "@/lib/backend-api";
import type {
  CreateFavoriteLocation,
  FavoriteLocation,
} from "@/features/location/types/favorite-location";

type FavoriteLocationResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number };

type CsrfToken = {
  headerName: "X-CSRF-TOKEN";
  token: string;
};

export async function getFavoriteLocations(
  cookieHeader: string,
): Promise<FavoriteLocationResult<FavoriteLocation[]>> {
  try {
    const response = await fetch(
      getBackendApiUrl("/api/v1/users/me/locations"),
      {
        cache: "no-store",
        headers: requestHeaders(cookieHeader),
      },
    );
    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const payload: unknown = await response.json();
    return isFavoriteLocationList(payload)
      ? { ok: true, data: payload }
      : { ok: false, status: 502 };
  } catch {
    return { ok: false, status: 503 };
  }
}

export async function createFavoriteLocation(
  cookieHeader: string,
  location: CreateFavoriteLocation,
): Promise<FavoriteLocationResult<FavoriteLocation>> {
  const csrf = await getCsrfToken(cookieHeader);
  if (!csrf.ok) {
    return csrf;
  }

  try {
    const response = await fetch(
      getBackendApiUrl("/api/v1/users/me/locations"),
      {
        method: "POST",
        cache: "no-store",
        headers: {
          ...requestHeaders(cookieHeader),
          "Content-Type": "application/json",
          [csrf.data.headerName]: csrf.data.token,
        },
        body: JSON.stringify(location),
      },
    );
    if (!response.ok) {
      return { ok: false, status: response.status };
    }

    const payload: unknown = await response.json();
    return isFavoriteLocation(payload)
      ? { ok: true, data: payload }
      : { ok: false, status: 502 };
  } catch {
    return { ok: false, status: 503 };
  }
}

export async function deleteFavoriteLocation(
  cookieHeader: string,
  locationId: string,
): Promise<FavoriteLocationResult<null>> {
  const csrf = await getCsrfToken(cookieHeader);
  if (!csrf.ok) {
    return csrf;
  }

  try {
    const response = await fetch(
      getBackendApiUrl(`/api/v1/users/me/locations/${locationId}`),
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
): Promise<FavoriteLocationResult<CsrfToken>> {
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
  return {
    Accept: "application/json",
    Cookie: cookieHeader,
  };
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

function isFavoriteLocationList(payload: unknown): payload is FavoriteLocation[] {
  return Array.isArray(payload) && payload.every(isFavoriteLocation);
}

function isFavoriteLocation(payload: unknown): payload is FavoriteLocation {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const location = payload as Partial<FavoriteLocation>;
  return (
    typeof location.id === "string" &&
    typeof location.name === "string" &&
    typeof location.latitude === "number" &&
    typeof location.longitude === "number" &&
    typeof location.timezone === "string" &&
    typeof location.createdAt === "string"
  );
}
