"use server";

import { Client, Databases } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

function getAdminDB() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.API_KEY!);
  return new Databases(client);
}

const DB         = process.env.NEXT_PUBLIC_DATABASE_ID!;
const TABLES_COL = process.env.TABLES_COLLECTION_ID!;

/* ─── Guest: call waiter ─────────────────────────────
   No auth check — any guest at a table can call.
   Uses server SDK (API key) because guests don't have
   Appwrite session; the table doc update permission is
   handled by trusting the server action boundary.
─────────────────────────────────────────────────────── */
export async function callWaiter(tableId: string) {
  const db = getAdminDB();
  await db.updateDocument(DB, TABLES_COL, tableId, {
    is_calling: true,
    called_at:  new Date().toISOString(),
  });
}

/* ─── Admin: dismiss call ────────────────────────────
   Auth-guarded — only admin can reset is_calling.
─────────────────────────────────────────────────────── */
export async function dismissCall(tableId: string) {
  const cookieStore = await cookies();
  if (!cookieStore.get("kasoori_admin_session")?.value) redirect("/admin/login");

  const db = getAdminDB();
  await db.updateDocument(DB, TABLES_COL, tableId, {
    is_calling: false,
    called_at:  null,
  });
}