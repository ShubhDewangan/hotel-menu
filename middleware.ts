import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE  = "kasoori_admin_session"; // match whatever you set in adminLogin action
const LOGIN_PATH    = "/admin/login";
const DASHBOARD     = "/admin";

// All /admin routes that DON'T need auth
const PUBLIC_ADMIN  = [LOGIN_PATH];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Only intercept /admin routes
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const session = req.cookies.get(ADMIN_COOKIE)?.value;
  const isPublic = PUBLIC_ADMIN.some(p => pathname === p || pathname.startsWith(p + "/"));

  // ── Not logged in ────────────────────────────────
  if (!session) {
    if (isPublic) return NextResponse.next(); // let /admin/login through
    // Redirect to login, preserve intended destination
    const url = req.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  // ── Already logged in, hitting /admin/login ──────
  if (isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = DASHBOARD;
    url.searchParams.delete("redirect");
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};