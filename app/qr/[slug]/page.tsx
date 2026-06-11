import { NextRequest, NextResponse } from "next/server";
import { Client, Databases, Query, ID } from "node-appwrite";

const ENDPOINT   = process.env.NEXT_PUBLIC_ENDPOINT!;
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const API_KEY    = process.env.API_KEY!;
const DB         = process.env.NEXT_PUBLIC_DATABASE_ID!;
const QR_COL     = process.env.QR_CODES_COLLECTION_ID!;
const SCAN_COL   = process.env.SCAN_LOGS_COLLECTION_ID!;

function getDB() {
  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);
  return new Databases(client);
}

export default async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const db = getDB();

  try {
    // 1. Find the QR doc by slug
    const res = await db.listDocuments(DB, QR_COL, [
      Query.equal("slug", slug),
      Query.limit(1),
    ]);

    if (res.documents.length === 0) {
      return NextResponse.redirect(new URL("/404", req.url));
    }

    const qr  = res.documents[0];
    const now = new Date().toISOString();

    // 2. Write scan log + update QR doc — both awaited before redirect
    //    so we know the writes actually happened
    await Promise.all([
      // Append to scan_logs
      db.createDocument(DB, SCAN_COL, ID.unique(), {
        table_id:   qr.table_id,
        venue_id:   qr.venue_id,
        venue_slug: qr.venue_slug ?? "",
        scanned_at: now,
      }),

      // Update last_scanned_at on the QR doc
      db.updateDocument(DB, QR_COL, qr.$id, {
        last_scanned_at: now,
        // scan_count: read current then increment
        scan_count: (qr.scan_count ?? 0) + 1,
      }),
    ]);

    // 3. Redirect guest to menu
    const target = qr.resolved_url ?? `/menu?venue=${qr.venue_slug}`;
    return NextResponse.redirect(new URL(target, req.url));

  } catch (err) {
    console.error("[QR route error]", err);
    // Still redirect even if logging fails — guest experience first
    return NextResponse.redirect(new URL("/menu", req.url));
  }
}