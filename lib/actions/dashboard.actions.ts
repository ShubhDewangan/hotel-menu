"use server";

import { Client, Databases, Query } from "node-appwrite";
import { getTier } from "../utils.qr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

/* ─── Admin-only server SDK ──────────────────────────
   Instantiated fresh here with the API key.
   Never exposed to the browser.
─────────────────────────────────────────────────────── */
function getAdminDB() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.API_KEY!);
  return new Databases(client);
}

const DB = process.env.NEXT_PUBLIC_DATABASE_ID!;

const COL = {
  VENUES:          process.env.VENUES_COLLECTION_ID!,
  TABLES:          process.env.TABLES_COLLECTION_ID!,
  QR_CODES:        process.env.QR_CODES_COLLECTION_ID!,
  MENUS:           process.env.MENUS_COLLECTION_ID!,
  MENU_ITEMS:      process.env.MENU_ITEMS_COLLECTION_ID!,
  MENU_CATEGORIES: process.env.MENU_CATEGORIES_COLLECTION_ID!,
  EVENTS:          process.env.EVENTS_COLLECTION_ID!,
  SCAN_LOGS:       process.env.SCAN_LOGS_COLLECTION_ID!,
} as const;

/* ─── Auth guard ─────────────────────────────────────
   Every exported action calls this first.
   If the admin cookie is missing, redirect to login.
─────────────────────────────────────────────────────── */
async function requireAdmin() {
  const cookieStore = await cookies();
  const session = cookieStore.get("kasoori_admin_session")?.value;
  if (!session) redirect("/admin/login");
}

/* ══════════════════════════════════════════════════════
   TYPES
══════════════════════════════════════════════════════ */
export interface DashboardData {
  stats: {
    venueCount:     number;
    tableCount:     number;
    qrReady:        number;
    qrCoverage:     number;
    upcomingEvents: number;
    liveEvents:     number;
    activeMenus:    number;
    totalMenuItems: number;
  };
  venues:      VenueDashRow[];
  topItems:    MenuItemDash[];
  recentScans: ScanDay[];
  alerts:      DashAlert[];
}

export interface VenueDashRow {
  $id:           string;
  name:          string;
  slug:          string;
  theme:         string;
  is_active:     boolean;
  image_url?:    string;
  opening_hours?: string;
  tableCount:    number;
  qrReady:       number;
  qrCoverage:    number;
  lastScan?:     string;
  scanCountWeek: number;
}

export interface MenuItemDash {
  $id:               string;
  name:              string;
  description?:      string;
  price:             number;
  category:          string;
  venue_id:          string;
  venue_name:        string;
  is_available:      boolean;
  popularity_points: number;
  image_url?:        string;
  tier:              ReturnType<typeof getTier>;
}

export interface ScanDay  { date: string; count: number; }
export interface DashAlert { type: "warning" | "error" | "info"; message: string; }

/* ══════════════════════════════════════════════════════
   MAIN FETCH — single parallel call
══════════════════════════════════════════════════════ */
export async function getDashboardData(): Promise<DashboardData> {
  await requireAdmin();

  const db  = getAdminDB();
  const now = new Date();
      
  const venuesRes = await db.listDocuments(DB, COL.VENUES,     [Query.limit(50)])
  const tablesRes = await db.listDocuments(DB, COL.TABLES,     [Query.limit(200)])
  const qrRes = await db.listDocuments(DB, COL.QR_CODES,   [Query.limit(200)])
  const menusRes = await db.listDocuments(DB, COL.MENUS,      [Query.limit(50)])
  const itemsRes = await db.listDocuments(DB, COL.MENU_ITEMS, [Query.orderDesc("popularity_points"), Query.limit(100)])
  const eventsRes = await db.listDocuments(DB, COL.EVENTS,     [Query.limit(50)])
  const scanRes = await db.listDocuments(DB, COL.SCAN_LOGS,  [Query.orderDesc("scanned_at"), Query.limit(500)])

  const venues = venuesRes.documents;
  const tables = tablesRes.documents;
  const qrDocs = qrRes.documents;
  const menus  = menusRes.documents;
  const items  = itemsRes.documents;
  const events = eventsRes.documents;
  const scans  = scanRes.documents;

  /* ─── Venue rows ─────────────────────────────────── */
  const venueRows: VenueDashRow[] = venues.map(v => {
    const vTables = tables.filter(t => t.venue_id === v.$id);
    const vQRs    = qrDocs.filter(q => q.venue_id === v.$id && q.qr_image_url);
    const vScans  = scans.filter(s => s.venue_id === v.$id);

    const weekAgo   = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
    const weekScans = vScans.filter(s => new Date(s.scanned_at) > weekAgo);
    const coverage  = vTables.length > 0 ? Math.round((vQRs.length / vTables.length) * 100) : 0;

    return JSON.parse(JSON.stringify({
      $id:           v.$id,
      name:          v.name,
      slug:          v.slug,
      theme:         v.theme ?? v.slug,
      is_active:     v.is_active,
      image_url:     v.image_url ?? null,
      opening_hours: v.opening_hours ?? null,
      tableCount:    vTables.length,
      qrReady:       vQRs.length,
      qrCoverage:    coverage,
      lastScan:      vScans[0]?.scanned_at ?? null,
      scanCountWeek: weekScans.length,
    }));
  });

  /* ─── Menu items ─────────────────────────────────── */
  const venueNameMap: Record<string, string> = Object.fromEntries(venues.map(v => [v.$id, v.name]));

  const topItems: MenuItemDash[] = items.slice(0, 20).map(i =>
    JSON.parse(JSON.stringify({
      $id:               i.$id,
      name:              i.name,
      description:       i.description ?? null,
      price:             i.price,
      category:          i.category ?? "",
      venue_id:          i.venue_id ?? "",
      venue_name:        venueNameMap[i.venue_id] ?? "",
      is_available:      i.is_available ?? true,
      popularity_points: i.popularity_points ?? 0,
      image_url:         i.image_url ?? null,
      tier:              getTier(i.popularity_points ?? 0),
    }))
  );

  /* ─── Scan sparkline — last 7 days ──────────────── */
  const recentScans: ScanDay[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short" });
    const count = scans.filter(s =>
      new Date(s.scanned_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) ===
      d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })
    ).length;
    return { date: label, count };
  });

  /* ─── Events ─────────────────────────────────────── */
  const upcomingEvents = events.filter(e => new Date(e.start_date) > now).length;
  const liveEvents     = events.filter(e => {
    const s = new Date(e.start_date);
    const end = e.end_date ? new Date(e.end_date) : null;
    return s <= now && (!end || end >= now);
  }).length;

  /* ─── Alerts ─────────────────────────────────────── */
  const alerts: DashAlert[] = [];

  venueRows.filter(v => !v.is_active).forEach(v =>
    alerts.push({ type: "warning", message: `${v.name} is inactive` })
  );
  venueRows.filter(v => v.is_active && v.qrCoverage < 100).forEach(v =>
    alerts.push({ type: "warning", message: `${v.name} — ${v.tableCount - v.qrReady} QR${v.tableCount - v.qrReady > 1 ? "s" : ""} missing` })
  );
  const staleMenus = menus.filter(m => {
    const diff = (now.getTime() - new Date(m.$updatedAt).getTime()) / 86_400_000;
    return diff > 30;
  });
  if (staleMenus.length > 0)
    alerts.push({ type: "info", message: `${staleMenus.length} menu${staleMenus.length > 1 ? "s" : ""} not updated in 30+ days` });
  if (liveEvents > 0)
    alerts.push({ type: "info", message: `${liveEvents} event${liveEvents > 1 ? "s are" : " is"} live right now` });

  return {
    stats: {
      venueCount:     venues.length,
      tableCount:     tables.length,
      qrReady:        qrDocs.filter(q => q.qr_image_url).length,
      qrCoverage:     tables.length > 0 ? Math.round((qrDocs.filter(q => q.qr_image_url).length / tables.length) * 100) : 0,
      upcomingEvents,
      liveEvents,
      activeMenus:    menus.filter(m => m.is_published !== false).length,
      totalMenuItems: items.length,
    },
    venues:      venueRows,
    topItems,
    recentScans,
    alerts,
  };
}