// ─────────────────────────────────────────────────────────────
// lib/appwrite.ts
//
// Appwrite client singleton + all collection/database IDs.
// Import { db, COLLECTIONS } everywhere instead of hardcoding
// IDs across action files.
// ─────────────────────────────────────────────────────────────

import { Client, Databases, Storage, ID, Query } from "appwrite";

// ── Client ───────────────────────────────────────────────────
const client = new Client()
  .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "https://cloud.appwrite.io/v1")
  .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "");

export const db      = new Databases(client);
export const storage = new Storage(client);

// Re-export SDK helpers so action files only import from here
export { ID, Query };

// ── Database ID ──────────────────────────────────────────────
export const DB_ID = process.env.NEXT_PUBLIC_APPWRITE_DB_ID ?? "";

// ── Collection IDs ───────────────────────────────────────────
// Keep in sync with the Appwrite console collection names.
export const COLLECTIONS = {
  MENUS:           "menus",
  MENU_CATEGORIES: "menu_categories",   // create this collection in Appwrite
  MENU_ITEMS:      "menu_items",        // create this collection in Appwrite
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