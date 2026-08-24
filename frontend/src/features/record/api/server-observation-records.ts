import { getBackendApiUrl } from "@/lib/backend-api";
import type {
  CreateServerObservationRecord,
  ServerObservationRecord,
} from "@/features/record/types/server-observation-record";

type RecordResult<T> =
  | { ok: true; data: T }
  | { ok: false; status: number };

type CsrfToken = { headerName: "X-CSRF-TOKEN"; token: string };

export async function getServerObservationRecords(
  cookieHeader: string,
): Promise<RecordResult<ServerObservationRecord[]>> {
  try {
    const response = await fetch(getBackendApiUrl("/api/v1/users/me/records"), {
      cache: "no-store",
      headers: requestHeaders(cookieHeader),
    });
    if (!response.ok) {
      return { ok: false, status: response.status };
    }
    const payload: unknown = await response.json();
    return isRecordList(payload)
      ? { ok: true, data: payload }
      : { ok: false, status: 502 };
  } catch {
    return { ok: false, status: 503 };
  }
}

export async function createServerObservationRecord(
  cookieHeader: string,
  record: CreateServerObservationRecord,
): Promise<RecordResult<ServerObservationRecord>> {
  const csrf = await getCsrfToken(cookieHeader);
  if (!csrf.ok) {
    return csrf;
  }
  try {
    const response = await fetch(getBackendApiUrl("/api/v1/users/me/records"), {
      method: "POST",
      cache: "no-store",
      headers: {
        ...requestHeaders(cookieHeader),
        "Content-Type": "application/json",
        [csrf.data.headerName]: csrf.data.token,
      },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      return { ok: false, status: response.status };
    }
    const payload: unknown = await response.json();
    return isRecord(payload)
      ? { ok: true, data: payload }
      : { ok: false, status: 502 };
  } catch {
    return { ok: false, status: 503 };
  }
}

export async function deleteServerObservationRecord(
  cookieHeader: string,
  recordId: string,
): Promise<RecordResult<null>> {
  const csrf = await getCsrfToken(cookieHeader);
  if (!csrf.ok) {
    return csrf;
  }
  try {
    const response = await fetch(
      getBackendApiUrl(`/api/v1/users/me/records/${recordId}`),
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

async function getCsrfToken(cookieHeader: string): Promise<RecordResult<CsrfToken>> {
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
  return token.headerName === "X-CSRF-TOKEN" && typeof token.token === "string";
}

function isRecordList(payload: unknown): payload is ServerObservationRecord[] {
  return Array.isArray(payload) && payload.every(isRecord);
}

function isRecord(payload: unknown): payload is ServerObservationRecord {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const record = payload as Partial<ServerObservationRecord>;
  return (
    typeof record.id === "string" &&
    typeof record.observedAt === "string" &&
    typeof record.timezone === "string" &&
    (typeof record.latitude === "number" || record.latitude === null) &&
    (typeof record.longitude === "number" || record.longitude === null) &&
    typeof record.comment === "string" &&
    Array.isArray(record.hashtags) &&
    record.hashtags.every((tag) => typeof tag === "string") &&
    record.mediaStatus === "NOT_ATTACHED" &&
    typeof record.createdAt === "string"
  );
}
