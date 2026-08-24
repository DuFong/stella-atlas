import { deleteFavoriteLocation } from "@/features/location/api/favorite-locations";
import { NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ locationId: string }>;
};

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { locationId } = await context.params;
  const cookieHeader = request.headers.get("cookie") ?? "";
  const result = await deleteFavoriteLocation(cookieHeader, locationId);

  return result.ok
    ? new NextResponse(null, { status: 204 })
    : NextResponse.json(
        { code: "FAVORITE_LOCATION_REQUEST_FAILED" },
        { status: result.status },
      );
}
