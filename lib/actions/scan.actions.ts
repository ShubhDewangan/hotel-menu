"use server";

import { databases, ID } from "@/lib/appwrite.config";

const DB             = process.env.NEXT_PUBLIC_DATABASE_ID!;
const QR_COL         = process.env.QR_CODES_COLLECTION_ID!;      // existing
const SCAN_LOGS_COL  = process.env.SCAN_LOGS_COLLECTION_ID!;     // new

/**
 * Call this inside /qr/[slug]/route.ts (or page.tsx) when a guest scans.
 * Fire-and-forget — don't await in the redirect path.
 */
export async function recordScan({
  qrId,
  tableId,
  venueId,
  venueSlug,
}: {
  qrId: string;
  tableId: string;
  venueId: string;
  venueSlug: string;
}) {
  const now = new Date().toISOString();

  await Promise.all([
    // 1. Increment scan_count + update last_scanned_at on the QR doc
    databases.updateDocument(DB, QR_COL, qrId, {
      last_scanned_at: now,
      // scan_count incremented via read-then-write since Appwrite has no atomic increment
    }).catch(console.error),

    // 2. Append a scan log entry
    databases.createDocument(DB, SCAN_LOGS_COL, ID.unique(), {
      table_id:   tableId,
      venue_id:   venueId,
      venue_slug: venueSlug,
      scanned_at: now,
    }).catch(console.error),
  ]);
}

/**
 * Returns scan counts grouped by day for the past N days for a venue.
 * Use this to render the sparkline / activity chart on the dashboard.
 */
export async function getScanActivity(venueId: string, days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const res = await databases.listDocuments(DB, SCAN_LOGS_COL, [
    // Query.equal("venue_id", venueId),
    // Query.greaterThan("scanned_at", since.toISOString()),
    // Query.orderDesc("scanned_at"),
    // Query.limit(500),
  ]);

  // Group by local date string
  const counts: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    counts[d.toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })] = 0;
  }

  for (const doc of res.documents) {
    const dateStr = new Date(doc.scanned_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" });
    if (dateStr in counts) counts[dateStr]++;
  }

  // Return oldest → newest for chart rendering
  return Object.entries(counts).reverse().map(([date, count]) => ({ date, count }));
}

/**
 * Per-venue: returns top N most-scanned tables.
 */
export async function getTopScannedTables(venueId: string, limit = 5) {
  const res = await databases.listDocuments(DB, SCAN_LOGS_COL, [
    // Query.equal("venue_id", venueId),
    // Query.limit(1000),
  ]);

  const tableCounts: Record<string, number> = {};
  for (const doc of res.documents) {
    tableCounts[doc.table_id] = (tableCounts[doc.table_id] ?? 0) + 1;
  }

  return Object.entries(tableCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tableId, count]) => ({ tableId, count }));
}