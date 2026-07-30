import type {
  AuthSession,
  CurrentUser,
} from "@/features/auth/types/auth";
import { getBackendApiUrl } from "@/lib/backend-api";

export async function getAuthSession(
  cookieHeader: string,
): Promise<AuthSession> {
  if (!hasSessionCookie(cookieHeader)) {
    return { status: "anonymous" };
  }

  try {
    const response = await fetch(getBackendApiUrl("/api/v1/users/me"), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
        Cookie: cookieHeader,
      },
    });

    if (response.status === 401) {
      return { status: "anonymous" };
    }
    if (!response.ok) {
      return { status: "unavailable" };
    }

    const payload: unknown = await response.json();
    return isCurrentUser(payload)
      ? { status: "authenticated", user: payload }
      : { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

function hasSessionCookie(cookieHeader: string): boolean {
  return cookieHeader
    .split(";")
    .some((cookie) => cookie.trim().startsWith("JSESSIONID="));
}

function isCurrentUser(payload: unknown): payload is CurrentUser {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }

  const user = payload as Partial<CurrentUser>;
  return (
    isNullableString(user.name) &&
    isNullableString(user.email) &&
    isNullableString(user.pictureUrl)
  );
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}
