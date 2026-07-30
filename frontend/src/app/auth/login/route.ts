import { getBackendApiUrl } from "@/lib/backend-api";
import { NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  if (process.env.AUTH_ENABLED !== "true") {
    return NextResponse.redirect(
      new URL("/?auth=oauth-pending", request.url),
    );
  }

  return NextResponse.redirect(
    getBackendApiUrl("/oauth2/authorization/google"),
  );
}
