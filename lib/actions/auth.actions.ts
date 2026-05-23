"use server";

import { Client, Account } from "node-appwrite";
import { cookies } from "next/headers";

const ENDPOINT   = process.env.NEXT_PUBLIC_ENDPOINT ?? "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";
const ADMIN_EMAIL    = process.env.ADMIN_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const ADMIN_CODE     = process.env.ADMIN_SECRET_CODE ?? "";
const SESSION_COOKIE = "admin_session";

export async function adminLogin(data: {
  email:    string;
  password: string;
  code:     string;
}): Promise<{ success: boolean; error?: string }> {

  // 1. Validate code first — no network call needed
  if (!ADMIN_CODE || data.code !== ADMIN_CODE) {
    return { success: false, error: "Invalid secret code." };
  }

  // 2. Validate email
  if (!ADMIN_EMAIL || data.email !== ADMIN_EMAIL) {
    return { success: false, error: "Invalid credentials." };
  }

  // 3. Create Appwrite session
  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID);

    const account = new Account(client);
    const session = await account.createEmailPasswordSession(
      data.email,
      data.password
    );

    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, session.secret, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      path:     "/",
      maxAge:   60 * 60 * 24 * 7,
    });

    return { success: true };
  } catch (err: unknown) {
    console.error("Login error:", err);
    return { success: false, error: "Invalid credentials." };
  }
}

export async function adminLogout(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const secret = cookieStore.get(SESSION_COOKIE)?.value;
    if (secret) {
      const client = new Client()
        .setEndpoint(ENDPOINT)
        .setProject(PROJECT_ID)
        .setSession(secret);
      await new Account(client).deleteSession("current");
    }
  } catch {
    // already expired
  }
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getAdminSession(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value ?? null;
}

export async function isAdminLoggedIn(): Promise<boolean> {
  const cookieStore = await cookies();
  const secret = cookieStore.get(SESSION_COOKIE)?.value;
  if (!secret) return false;
  try {
    const client = new Client()
      .setEndpoint(ENDPOINT)
      .setProject(PROJECT_ID)
      .setSession(secret);
    await new Account(client).get();
    return true;
  } catch {
    return false;
  }
}