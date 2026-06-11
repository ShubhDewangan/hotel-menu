"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE   = "kasoori_admin_session";
const SECRET_CODE    = process.env.ADMIN_SECRET_CODE!;   // your three-factor secret
const SESSION_MAX    = 60 * 60 * 24 * 7;                 // 7 days in seconds

export async function adminLogin({
  email,
  password,
  secretCode,
  redirectTo = "/admin",
}: {
  email:       string;
  password:    string;
  secretCode:  string;
  redirectTo?: string;
}) {
  // ── 1. Validate secret code first (cheapest check) ──
  if (secretCode !== SECRET_CODE) {
    return { error: "Invalid credentials" };
  }

  // ── 2. Verify email + password against Appwrite ──────
  // (replace with your existing Appwrite account.createEmailPasswordSession)
  // const session = await account.createEmailPasswordSession(email, password);

  // ── 3. Set httpOnly cookie ────────────────────────────
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, "authenticated" /* or session.$id */, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge:   SESSION_MAX,
    path:     "/admin",
  });

  // ── 4. Redirect to intended destination ──────────────
  // Only allow redirects within /admin to prevent open redirect
  const safe = redirectTo.startsWith("/admin") ? redirectTo : "/admin";
  redirect(safe);
}

export async function adminLogout() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  // don't redirect here — caller does window.location.href = "/admin/login"
}