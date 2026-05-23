// ─────────────────────────────────────────────────────────────
// lib/appwrite.ts
// ─────────────────────────────────────────────────────────────

import { Client, Databases, Storage, ID, Query } from "appwrite";

const ENDPOINT   = process.env.NEXT_PUBLIC_ENDPOINT ?? "https://cloud.appwrite.io/v1";
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";

// ── Public client (for guest menu page) ──────────────────────
const client = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const db      = new Databases(client);
export const storage = new Storage(client);
export { ID, Query };

// ── Authenticated client (for admin actions) ─────────────────
// Pass the session secret from the admin cookie
export function getAuthClient(sessionSecret: string) {
  const authClient = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setSession(sessionSecret);
  return {
    db:      new Databases(authClient),
    storage: new Storage(authClient),
  };
}

// ── Database ID ──────────────────────────────────────────────
export const DB_ID = process.env.NEXT_PUBLIC_DATABASE_ID ?? "";

// ── Collection IDs ───────────────────────────────────────────
export const COLLECTIONS = {
  MENUS:           "menu",
  MENU_CATEGORIES: "menu_categories",
  MENU_ITEMS:      "menu_items",
  VENUES:          "venues",
  TABLES:          "tables",
  SEATS:           "seats",
  QR_CODES:        "qr_codes",
  EVENTS:          "events",
} as const;

export type CollectionKey = keyof typeof COLLECTIONS;

// ── Storage bucket IDs ───────────────────────────────────────
export const BUCKETS = {
  QR_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_QR_BUCKET_ID ?? "qr_images",
} as const;