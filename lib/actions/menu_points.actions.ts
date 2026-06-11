"use server";

import { Client, Databases } from "node-appwrite";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getTier } from "../utils.qr";

function getAdminDB() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!)
    .setKey(process.env.API_KEY!);
  return new Databases(client);
}

const DB            = process.env.NEXT_PUBLIC_DATABASE_ID!;
const MENU_ITEM_COL = process.env.MENU_ITEMS_COLLECTION_ID!;

async function requireAdmin() {
  const cookieStore = await cookies();
  if (!cookieStore.get("kasoori_admin_session")?.value) redirect("/admin/login");
}

/* ─── Tier thresholds ────────────────────────────────
    0–4   → normal
    5–9   → popular
   10–19  → top_pick
   20+    → chefs_choice
─────────────────────────────────────────────────────── */
export type PopularityTier = "normal" | "popular" | "top_pick" | "chefs_choice";

export async function adjustItemPoints(
  itemId: string,
  delta: 1 | -1,
  currentPoints: number
): Promise<{ points: number; tier: PopularityTier }> {
  await requireAdmin();

  const db        = getAdminDB();
  const newPoints = Math.max(0, currentPoints + delta);

  await db.updateDocument(DB, MENU_ITEM_COL, itemId, {
    popularity_points: newPoints,
  });

  revalidatePath("/admin");
  revalidatePath("/menus");

  return { points: newPoints, tier: getTier(newPoints) };
}

export { getTier };
