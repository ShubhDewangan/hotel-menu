import { Client, Databases, Storage, ID, Query } from "node-appwrite";
import {
  Client as BrowserClient,
  Databases as BrowserDatabases,
  Storage  as BrowserStorage,
} from "appwrite";


const ENDPOINT   = process.env.NEXT_PUBLIC_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY    = process.env.APPWRITE_API_KEY!;

/* ─── Server SDK (admin — API key) ──────────────────── */
const serverClient = new Client()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID)
  .setKey(API_KEY);

export const databases = new Databases(serverClient);
export const storage   = new Storage(serverClient);
export { ID, Query };

/* ─── Browser SDK (guest — no auth) ─────────────────── */
const browserClient = new BrowserClient()
  .setEndpoint(ENDPOINT)
  .setProject(PROJECT_ID);

export const guestDatabases = new BrowserDatabases(browserClient);
export const guestStorage   = new BrowserStorage(browserClient);

/* ─── Centralised collection IDs ────────────────────── */
export const COLLECTIONS = {
  EVENTS:           process.env.EVENTS_COLLECTION_ID!,
  MENU_CATEGORIES:  process.env.MENU_CATEGORIES_COLLECTION_ID!,
  MENU_ITEMS:       process.env.MENU_ITEMS_COLLECTION_ID!,
  MENUS:            process.env.MENUS_COLLECTION_ID!,
  QR_CODES:         process.env.QR_CODES_COLLECTION_ID!,
  SCAN_LOGS:        process.env.SCAN_LOGS_COLLECTION_ID!,
  SEATS:            process.env.SEATS_COLLECTION_ID!,
  TABLES:           process.env.TABLES_COLLECTION_ID!,
  VENUES:           process.env.VENUES_COLLECTION_ID!,
  WAITER_CALLS:     process.env.WAITER_CALLS_COLLECTION_ID!,
} as const;

export const DATABASE_ID = process.env.NEXT_PUBLIC_DATABASE_ID!;