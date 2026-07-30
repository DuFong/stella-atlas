import { logout } from "@/features/auth/api/logout";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const succeeded = await logout(cookieHeader);
  const destination = new URL(
    succeeded ? "/" : "/?auth=logout-error",
    request.url,
  );
  const response = NextResponse.redirect(destination, 303);

  if (succeeded) {
    response.cookies.delete("JSESSIONID");
  }

  return response;
}
