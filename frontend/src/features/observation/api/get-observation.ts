import type {
  ObservationApiError,
  ObservationApiResult,
  ObservationForecast,
  ObservationQuery,
} from "@/features/observation/types/observation";

const DEFAULT_API_BASE_URL = "http://localhost:8080";

export async function getObservation(
  query: ObservationQuery,
): Promise<ObservationApiResult> {
  const baseUrl = process.env.API_BASE_URL ?? DEFAULT_API_BASE_URL;
  const url = new URL("/api/v1/observations", baseUrl);
  url.searchParams.set("latitude", query.latitude);
  url.searchParams.set("longitude", query.longitude);
  url.searchParams.set("date", query.date);

  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
    const payload: unknown = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        error: toApiError(payload),
      };
    }
    if (!isObservationForecast(payload)) {
      return {
        ok: false,
        error: {
          code: "INVALID_API_RESPONSE",
          message: "관측 결과 형식을 확인할 수 없습니다.",
        },
      };
    }
    return { ok: true, data: payload };
  } catch {
    return {
      ok: false,
      error: {
        code: "API_UNAVAILABLE",
        message: "관측 API에 연결할 수 없습니다.",
      },
    };
  }
}

function toApiError(payload: unknown): ObservationApiError {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "code" in payload &&
    "message" in payload &&
    typeof payload.code === "string" &&
    typeof payload.message === "string"
  ) {
    return {
      code: payload.code,
      message: payload.message,
    };
  }
  return {
    code: "API_REQUEST_FAILED",
    message: "관측 결과를 불러오지 못했습니다.",
  };
}

function isObservationForecast(payload: unknown): payload is ObservationForecast {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const value = payload as Partial<ObservationForecast>;
  return (
    typeof value.date === "string" &&
    typeof value.generatedAt === "string" &&
    typeof value.location?.timezone === "string" &&
    typeof value.summary?.score === "number" &&
    typeof value.summary?.grade === "string" &&
    typeof value.astronomy?.moonIllumination === "number" &&
    Array.isArray(value.hourly)
  );
}
