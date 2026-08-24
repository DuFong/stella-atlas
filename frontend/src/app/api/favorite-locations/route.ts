import {
  createFavoriteLocation,
  getFavoriteLocations,
} from "@/features/location/api/favorite-locations";
import type { CreateFavoriteLocation } from "@/features/location/types/favorite-location";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const result = await getFavoriteLocations(cookieHeader(request));
  return result.ok
    ? NextResponse.json(result.data)
    : errorResponse(result.status);
}

export async function POST(request: NextRequest) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return errorResponse(400);
  }
  if (!isCreateFavoriteLocation(payload)) {
    return errorResponse(400);
  }

  const result = await createFavoriteLocation(cookieHeader(request), payload);
  return result.ok
    ? NextResponse.json(result.data, { status: 201 })
    : errorResponse(result.status);
}

function cookieHeader(request: NextRequest): string {
  return request.headers.get("cookie") ?? "";
}

function isCreateFavoriteLocation(
  payload: unknown,
): payload is CreateFavoriteLocation {
  if (typeof payload !== "object" || payload === null) {
    return false;
  }
  const location = payload as Partial<CreateFavoriteLocation>;
  return (
    typeof location.name === "string" &&
    typeof location.latitude === "number" &&
    Number.isFinite(location.latitude) &&
    typeof location.longitude === "number" &&
    Number.isFinite(location.longitude)
  );
}

function errorResponse(status: number) {
  return NextResponse.json(
    { code: "FAVORITE_LOCATION_REQUEST_FAILED" },
    { status },
  );
}
