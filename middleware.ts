import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE = "admin_session";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith("/admin")) return NextResponse.next();
  if (pathname === "/admin/login") return NextResponse.next();

  // Read cookie from header directly as fallback
  const cookieHeader = request.headers.get("cookie") ?? "";
  const hasSession =
    request.cookies.get(SESSION_COOKIE)?.value ||
    cookieHeader.includes(`${SESSION_COOKIE}=`);

  console.log("MIDDLEWARE session found:", !!hasSession);

  if (!hasSession) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};