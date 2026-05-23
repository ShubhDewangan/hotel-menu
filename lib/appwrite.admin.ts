// ─────────────────────────────────────────────────────────────
// lib/appwrite.admin.ts
//
// Server-only Appwrite client using API key.
// Use this in all admin server actions — never import in
// client components.
// ─────────────────────────────────────────────────────────────

import { Client, Databases, Storage, ID, Query } from "node-appwrite";

const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT ?? "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "")
  .setKey(process.env.API_KEY ?? "");

export const adminDb      = new Databases(client);
export const adminStorage = new Storage(client);
export { ID, Query };

export const DB_ID = process.env.NEXT_PUBLIC_DATABASE_ID ?? "";

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

export const BUCKETS = {
  QR_IMAGES: process.env.NEXT_PUBLIC_APPWRITE_QR_BUCKET_ID ?? "qr_images",
} as const;

// Strips null prototype from Appwrite documents so they can be
// passed from Server Actions → Client Components safely.
export function serialize<T>(doc: T): T {
  return JSON.parse(JSON.stringify(doc));
}