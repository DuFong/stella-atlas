import {
  clearRecentLocations,
  getRecentLocations,
} from "@/features/location/api/recent-locations";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const result = await getRecentLocations(cookieHeader(request));
  return result.ok
    ? NextResponse.json(result.data)
    : errorResponse(result.status);
}

export async function DELETE(request: NextRequest) {
  const result = await clearRecentLocations(cookieHeader(request));
  return result.ok
    ? new NextResponse(null, { status: 204 })
    : errorResponse(result.status);
}

function cookieHeader(request: NextRequest): string {
  return request.headers.get("cookie") ?? "";
}

function errorResponse(status: number) {
  return NextResponse.json(
    { code: "RECENT_LOCATION_REQUEST_FAILED" },
    { status },
  );
}
