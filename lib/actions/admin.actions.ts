/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { adminDb as db, adminStorage as storage, ID, Query, DB_ID, COLLECTIONS, BUCKETS, serialize } from "@/lib/appwrite.admin";
import { getQRTargetUrl } from "@/lib/utils.qr";
import type {
  MenuDoc, MenuCategoryDoc, MenuItemDoc,
  VenueDoc, TableDoc, SeatDoc, QRCodeDoc, EventDoc, QRCodeWithSeat,
} from "@/types/appwrite";
import type { MenuConfig, MenuCategory, MenuItem } from "@/types/menu";

function makeSlug(base: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return `${clean}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildMenuConfig(menu: MenuDoc, categories: MenuCategoryDoc[], itemsMap: Record<string, MenuItemDoc[]>): MenuConfig {
  return {
    theme: menu.theme as MenuConfig["theme"],
    label: menu.label,
    categories: categories.sort((a, b) => a.sort_order - b.sort_order).map((cat): MenuCategory => ({
      name: cat.name, sortOrder: cat.sort_order,
      items: (itemsMap[cat.$id] ?? []).sort((a, b) => a.sort_order - b.sort_order).map((item): MenuItem => ({
        name: item.name, description: item.description, price: item.price,
        isVeg: item.is_veg, isAvailable: item.is_available, sortOrder: item.sort_order,
        image: undefined
      })),
    })),
  };
}

// ═══════════════════════════════════════════════════════════════
// MENU
// ═══════════════════════════════════════════════════════════════

export async function createMenu(data: { label: string; theme: string }): Promise<MenuDoc> {
  const _d = await db.createDocument<MenuDoc>(DB_ID, COLLECTIONS.MENUS, ID.unique(), data);
  return serialize(_d);
}

export async function updateMenu(menuId: string, data: Partial<Pick<MenuDoc, "label" | "theme">>): Promise<MenuDoc> {
  const _d = await db.updateDocument<MenuDoc>(DB_ID, COLLECTIONS.MENUS, menuId, data);
  return serialize(_d);
}

export async function deleteMenu(menuId: string): Promise<void> {
  const categories = await listCategoriesByMenu(menuId);
  for (const cat of categories) await deleteCategoryWithItems(cat.$id);
  await db.deleteDocument(DB_ID, COLLECTIONS.MENUS, menuId);
}

export async function listMenus(): Promise<MenuDoc[]> {
  const res = await db.listDocuments<MenuDoc>(DB_ID, COLLECTIONS.MENUS, [Query.limit(100)]);
  return serialize(res.documents);
}

export async function getMenuWithCategories(menuId: string): Promise<MenuConfig> {
  const menu = await db.getDocument<MenuDoc>(DB_ID, COLLECTIONS.MENUS, menuId);
  const categories = await listCategoriesByMenu(menuId);
  const itemsMap: Record<string, MenuItemDoc[]> = {};
  await Promise.all(categories.map(async (cat) => { itemsMap[cat.$id] = await listItemsByCategory(cat.$id); }));
  return buildMenuConfig(menu, categories, itemsMap);
}

// ═══════════════════════════════════════════════════════════════
// MENU CATEGORIES
// ═══════════════════════════════════════════════════════════════

export async function listCategoriesByMenu(menuId: string): Promise<MenuCategoryDoc[]> {
  const res = await db.listDocuments<MenuCategoryDoc>(DB_ID, COLLECTIONS.MENU_CATEGORIES, [
    Query.equal("menu_id", menuId), Query.orderAsc("sort_order"), Query.limit(100),
  ]);
  return serialize(res.documents);
}

export async function createCategory(data: { menu_id: string; name: string; sort_order: number }): Promise<MenuCategoryDoc> {
  const _d = await db.createDocument<MenuCategoryDoc>(DB_ID, COLLECTIONS.MENU_CATEGORIES, ID.unique(), data);
  return serialize(_d);
}

export async function updateCategory(categoryId: string, data: Partial<Pick<MenuCategoryDoc, "name" | "sort_order">>): Promise<MenuCategoryDoc> {
  const _d = await db.updateDocument<MenuCategoryDoc>(DB_ID, COLLECTIONS.MENU_CATEGORIES, categoryId, data);
  return serialize(_d);
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteCategoryWithItems(categoryId);
}

export async function deleteCategoryWithItems(categoryId: string): Promise<void> {
  const items = await listItemsByCategory(categoryId);
  await Promise.all(items.map((i) => deleteMenuItem(i.$id)));
  await db.deleteDocument(DB_ID, COLLECTIONS.MENU_CATEGORIES, categoryId);
}

// ═══════════════════════════════════════════════════════════════
// MENU ITEMS
// ═══════════════════════════════════════════════════════════════

export async function listItemsByCategory(categoryId: string): Promise<MenuItemDoc[]> {
  const res = await db.listDocuments<MenuItemDoc>(DB_ID, COLLECTIONS.MENU_ITEMS, [
    Query.equal("category_id", categoryId), Query.orderAsc("sort_order"), Query.limit(100),
  ]);
  return serialize(res.documents);
}

export async function createMenuItem(data: {
  category_id: string; name: string; description: string;
  price: number; is_veg: boolean; is_available: boolean; sort_order: number;
}): Promise<MenuItemDoc> {
  const _d = await db.createDocument<MenuItemDoc>(DB_ID, COLLECTIONS.MENU_ITEMS, ID.unique(), data);
  return serialize(_d);
}

export async function updateMenuItem(itemId: string, data: Partial<Pick<MenuItemDoc, "name" | "description" | "price" | "is_veg" | "is_available" | "sort_order">>): Promise<MenuItemDoc> {
  const _d = await db.updateDocument<MenuItemDoc>(DB_ID, COLLECTIONS.MENU_ITEMS, itemId, data);
  return serialize(_d);
}

export async function toggleItemAvailability(itemId: string, isAvailable: boolean): Promise<MenuItemDoc> {
  const _d = await db.updateDocument<MenuItemDoc>(DB_ID, COLLECTIONS.MENU_ITEMS, itemId, { is_available: isAvailable });
  return serialize(_d);
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await db.deleteDocument(DB_ID, COLLECTIONS.MENU_ITEMS, itemId);
}

// ═══════════════════════════════════════════════════════════════
// VENUES
// ═══════════════════════════════════════════════════════════════

export async function listVenues(): Promise<VenueDoc[]> {
  const res = await db.listDocuments<VenueDoc>(DB_ID, COLLECTIONS.VENUES, [Query.limit(100)]);
  return serialize(res.documents);
}

export async function getVenue(venueId: string): Promise<VenueDoc> {
  const doc = await db.getDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, venueId);
  return serialize(doc);
}

export async function getVenueBySlug(slug: string): Promise<VenueDoc | null> {
  const res = await db.listDocuments<VenueDoc>(DB_ID, COLLECTIONS.VENUES, [Query.equal("slug", slug), Query.limit(1)]);
  return res.documents[0] ? serialize(res.documents[0]) : null;
}

export async function createVenue(data: { name: string; slug: string; description: string; theme: string }): Promise<{ venue: VenueDoc; menu: MenuDoc }> {
  const menu = await createMenu({ label: `${data.name} Menu`, theme: data.theme });
  const _d = await db.createDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, ID.unique(), {
    name: data.name, slug: data.slug, description: data.description, menu_id: menu.$id, is_active: true,
  });
  return { venue: serialize(_d), menu };
}

export async function updateVenue(venueId: string, data: Partial<Pick<VenueDoc, "name" | "slug" | "description" | "menu_id" | "is_active">>): Promise<VenueDoc> {
  const _d = await db.updateDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, venueId, data);
  return serialize(_d);
}

export async function toggleVenueActive(venueId: string, isActive: boolean): Promise<VenueDoc> {
  const _d = await db.updateDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, venueId, { is_active: isActive });
  return serialize(_d);
}

export async function deleteVenue(venueId: string): Promise<void> {
  const tables = await listTablesByVenue(venueId);
  for (const table of tables) await deleteTableWithQR(table.$id);
  await db.deleteDocument(DB_ID, COLLECTIONS.VENUES, venueId);
}

// ═══════════════════════════════════════════════════════════════
// TABLES
// ═══════════════════════════════════════════════════════════════

export async function listTablesByVenue(venueId: string): Promise<TableDoc[]> {
  const res = await db.listDocuments<TableDoc>(DB_ID, COLLECTIONS.TABLES, [
    Query.equal("venue_id", venueId), Query.orderAsc("table_number"), Query.limit(100),
  ]);
  return serialize(res.documents);
}

export async function createTable(data: { venue_id: string; table_number: number; seat_count: number }): Promise<TableDoc> {
  const _d = await db.createDocument<TableDoc>(DB_ID, COLLECTIONS.TABLES, ID.unique(), { ...data, is_active: true });
  return serialize(_d);
}

export async function updateTable(tableId: string, data: Partial<Pick<TableDoc, "table_number" | "seat_count" | "is_active">>): Promise<TableDoc> {
  const _d = await db.updateDocument<TableDoc>(DB_ID, COLLECTIONS.TABLES, tableId, data);
  return serialize(_d);
}

export async function toggleTableActive(tableId: string, isActive: boolean): Promise<TableDoc> {
  const _d = await db.updateDocument<TableDoc>(DB_ID, COLLECTIONS.TABLES, tableId, { is_active: isActive });
  return serialize(_d);
}

// Delete table + its QR (no more seats)
export async function deleteTableWithQR(tableId: string): Promise<void> {
  await deleteQRForTable(tableId);
  await db.deleteDocument(DB_ID, COLLECTIONS.TABLES, tableId);
}

// Keep for backward compat
export async function deleteTableWithSeats(tableId: string): Promise<void> {
  await deleteTableWithQR(tableId);
}

// ═══════════════════════════════════════════════════════════════
// QR CODES — one per table
// ═══════════════════════════════════════════════════════════════

// Get existing QR for a table (null if none)
export async function getQRForTable(tableId: string): Promise<QRCodeDoc | null> {
  const res = await db.listDocuments<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, [
    Query.equal("table_id", tableId),
    Query.equal("is_active", true),
    Query.orderDesc("$createdAt"),
    Query.limit(1),
  ]);
  return res.documents[0] ? serialize(res.documents[0]) : null;
}

// Delete all QRs for a table
export async function deleteQRForTable(tableId: string): Promise<void> {
  const res = await db.listDocuments<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, [
    Query.equal("table_id", tableId), Query.limit(100),
  ]);
  await Promise.all(res.documents.map((qr: any) => db.deleteDocument(DB_ID, COLLECTIONS.QR_CODES, qr.$id)));
}

// Generate (or regenerate) QR for a table
// On regenerate: deletes old QR doc + storage file, creates fresh one
export async function generateQRForTable(data: {
  tableId: string;
  venueSlug: string;
  tableNumber: number;
  eventId?: string | null;
  regenerate?: boolean;
}): Promise<QRCodeDoc> {
  // Delete old QR if regenerating
  if (data.regenerate) {
    const old = await db.listDocuments<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, [
      Query.equal("table_id", data.tableId), Query.limit(100),
    ]);
    await Promise.all(old.documents.map(async (qr: any) => {
      // Delete storage file if exists
      if (qr.file_id) {
        try { await storage.deleteFile(BUCKETS.QR_IMAGES, qr.file_id); } catch {}
      }
      await db.deleteDocument(DB_ID, COLLECTIONS.QR_CODES, qr.$id);
    }));
  }

  const slug        = makeSlug(`${data.venueSlug}-t${data.tableNumber}`);
  const resolvedUrl = getQRTargetUrl(data.venueSlug, slug);

  const _d = await db.createDocument<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, ID.unique(), {
    table_id: data.tableId,
    event_id: data.eventId ?? null,
    slug,
    qr_image_url: null,
    resolved_url: resolvedUrl,
    generated_at: null,
    is_active: true,
  } as any);
  return serialize(_d);
}

// Upload QR image to storage and link back to the QR doc
export async function uploadQRImage(qrCodeId: string, imageBlob: Blob, fileName: string): Promise<QRCodeDoc> {
  const file      = await storage.createFile(BUCKETS.QR_IMAGES, ID.unique(), new File([imageBlob], fileName, { type: "image/png" }));
  const endpoint  = (process.env.NEXT_PUBLIC_ENDPOINT ?? "https://cloud.appwrite.io/v1").replace(/\/$/, "");
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "";
  const imageUrl  = `${endpoint}/storage/buckets/${BUCKETS.QR_IMAGES}/files/${file.$id}/view?project=${projectId}`;
  const _d = await db.updateDocument<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, qrCodeId, {
    qr_image_url: imageUrl,
    generated_at: new Date().toISOString(),
  });
  return serialize(_d);
}

export async function deleteQRCode(qrCodeId: string): Promise<void> {
  await db.deleteDocument(DB_ID, COLLECTIONS.QR_CODES, qrCodeId);
}

// QR slug resolution — used by /qr/[slug] page
export async function resolveQRSlug(slug: string): Promise<{
  venueSlug: string; tableId: string; eventId: string | null; resolvedUrl: string;
} | null> {
  const res = await db.listDocuments<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, [
    Query.equal("slug", slug), Query.equal("is_active", true), Query.limit(1),
  ]);
  const qr = res.documents[0];
  if (!qr) return null;

  const table = await db.getDocument<TableDoc>(DB_ID, COLLECTIONS.TABLES, qr.table_id);
  const venue = await db.getDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, table.venue_id);

  let eventId: string | null = qr.event_id ?? null;
  if (!eventId) {
    const ae = await getActiveEventForVenue(venue.$id);
    if (ae?.use_own_menu) eventId = ae.$id;
  }

  return { venueSlug: venue.slug, tableId: qr.table_id, eventId, resolvedUrl: qr.resolved_url };
}

// ═══════════════════════════════════════════════════════════════
// EVENTS
// ═══════════════════════════════════════════════════════════════

export async function listEvents(filters?: { venueId?: string; status?: "upcoming" | "active" | "past" }): Promise<EventDoc[]> {
  const queries: string[] = [Query.limit(100)];
  if (filters?.venueId) queries.push(Query.equal("venue_id", filters.venueId));
  const now = new Date().toISOString();
  if (filters?.status === "active")        { queries.push(Query.lessThanEqual("starts_at", now)); queries.push(Query.greaterThanEqual("ends_at", now)); }
  else if (filters?.status === "upcoming") queries.push(Query.greaterThan("starts_at", now));
  else if (filters?.status === "past")     queries.push(Query.lessThan("ends_at", now));
  const res = await db.listDocuments<EventDoc>(DB_ID, COLLECTIONS.EVENTS, queries);
  return serialize(res.documents);
}

export async function getActiveEventForVenue(venueId: string): Promise<EventDoc | null> {
  const now = new Date().toISOString();
  const res = await db.listDocuments<EventDoc>(DB_ID, COLLECTIONS.EVENTS, [
    Query.equal("venue_id", venueId), Query.equal("is_active", true),
    Query.lessThanEqual("starts_at", now), Query.greaterThanEqual("ends_at", now), Query.limit(1),
  ]);
  return res.documents[0] ? serialize(res.documents[0]) : null;
}

export async function createEvent(data: {
  venue_id: string; name: string; starts_at: string; ends_at: string; use_own_menu: boolean; menu_id?: string;
}): Promise<{ event: EventDoc; menu: MenuDoc | null }> {
  let menuId = data.menu_id ?? null;
  let menuDoc: MenuDoc | null = null;
  if (data.use_own_menu && !menuId) {
    menuDoc = await createMenu({ label: `${data.name} Menu`, theme: "event" });
    menuId = menuDoc.$id;
  }
  const _d = await db.createDocument<EventDoc>(DB_ID, COLLECTIONS.EVENTS, ID.unique(), {
    venue_id: data.venue_id, menu_id: menuId, name: data.name, slug: makeSlug(data.name),
    starts_at: data.starts_at, ends_at: data.ends_at, use_own_menu: data.use_own_menu, is_active: true,
  });
  return { event: serialize(_d), menu: menuDoc };
}

export async function updateEvent(eventId: string, data: Partial<Pick<EventDoc, "name" | "starts_at" | "ends_at" | "use_own_menu" | "menu_id" | "is_active">>): Promise<EventDoc> {
  const _d = await db.updateDocument<EventDoc>(DB_ID, COLLECTIONS.EVENTS, eventId, data);
  return serialize(_d);
}

export async function toggleEventActive(eventId: string, isActive: boolean): Promise<EventDoc> {
  const _d = await db.updateDocument<EventDoc>(DB_ID, COLLECTIONS.EVENTS, eventId, { is_active: isActive });
  return serialize(_d);
}

export async function deleteEvent(eventId: string): Promise<void> {
  await db.deleteDocument(DB_ID, COLLECTIONS.EVENTS, eventId);
}

// ═══════════════════════════════════════════════════════════════
// GUEST-FACING — menu resolution
// ═══════════════════════════════════════════════════════════════

export async function resolveMenuForVenue(venueSlug: string): Promise<{ menuConfig: MenuConfig; isEvent: boolean; eventId: string | null } | null> {
  const venue = await getVenueBySlug(venueSlug);
  if (!venue) return null;
  const activeEvent = await getActiveEventForVenue(venue.$id);
  if (activeEvent?.use_own_menu && activeEvent.menu_id) {
    return { menuConfig: await getMenuWithCategories(activeEvent.menu_id), isEvent: true, eventId: activeEvent.$id };
  }
  return { menuConfig: await getMenuWithCategories(venue.menu_id), isEvent: false, eventId: null };
}

export async function resolveMenuForEvent(eventId: string): Promise<MenuConfig | null> {
  const event = await db.getDocument<EventDoc>(DB_ID, COLLECTIONS.EVENTS, eventId);
  if (!event.use_own_menu || !event.menu_id) {
    const venue = await getVenue(event.venue_id);
    return getMenuWithCategories(venue.menu_id);
  }
  return getMenuWithCategories(event.menu_id);
}