/* eslint-disable @typescript-eslint/no-explicit-any */
// ─────────────────────────────────────────────────────────────
// actions/admin.actions.ts
//
// Every server action the admin panel and the /menu page needs.
// Organised into sections:
//
//   MENU        — create / update / delete menus, categories, items
//   VENUE       — create / update / toggle / delete venues
//   TABLE       — create / update / toggle / delete tables
//   SEAT        — auto-generate seats from seat_count
//   QR          — generate slug, store QR image, resolve URL
//   EVENT       — create / update / toggle / delete events
//   MENU PAGE   — read-only queries used by /menu (guest-facing)
//
// All functions are async and return typed results or throw.
// The "use server" directive is intentionally omitted here —
// wrap individual calls in Next.js server actions or API routes
// depending on your auth strategy.
// ─────────────────────────────────────────────────────────────

import { db, storage, ID, Query, DB_ID, COLLECTIONS, BUCKETS } from "@/lib/appwrite";
import { getQRTargetUrl } from "@/app/menu/page";
import type {
  MenuDoc,
  MenuCategoryDoc,
  MenuItemDoc,
  VenueDoc,
  TableDoc,
  SeatDoc,
  QRCodeDoc,
  EventDoc,
  MenuWithCategories,
  VenueWithTables,
  QRCodeWithSeat,
} from "@/types/appwrite";
import type { MenuConfig, MenuCategory, MenuItem } from "@/types/menu";

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

// Generates a URL-safe slug from a string + random suffix
function makeSlug(base: string): string {
  const clean = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const rand  = Math.random().toString(36).slice(2, 7);
  return `${clean}-${rand}`;
}

// Maps raw Appwrite MenuDoc + categories to the MenuConfig shape
// consumed by MenuPageClient and menuData.ts
function buildMenuConfig(
  menu:       MenuDoc,
  categories: MenuCategoryDoc[],
  itemsMap:   Record<string, MenuItemDoc[]>
): MenuConfig {
  return {
    // MenuConfig.theme must be a VenueTheme — cast is safe because
    // we only store valid theme strings when creating menus.
    theme: menu.theme as MenuConfig["theme"],
    label: menu.label,
    categories: categories
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((cat): MenuCategory => ({
        name:      cat.name,
        sortOrder: cat.sort_order,
        items: (itemsMap[cat.$id] ?? [])
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((item): MenuItem => ({
            name:        item.name,
            description: item.description,
            price:       item.price,
            isVeg:       item.is_veg,
            isAvailable: item.is_available,
            sortOrder:   item.sort_order,
          })),
      })),
  };
}


// ═════════════════════════════════════════════════════════════
// MENU ACTIONS
// ═════════════════════════════════════════════════════════════

// ── Create a new menu ─────────────────────────────────────────
export async function createMenu(data: {
  label: string;
  theme: string;
}): Promise<MenuDoc> {
  return db.createDocument<MenuDoc>(DB_ID, COLLECTIONS.MENUS, ID.unique(), {
    label: data.label,
    theme: data.theme,
  });
}

// ── Update menu label or theme ────────────────────────────────
export async function updateMenu(
  menuId: string,
  data: Partial<Pick<MenuDoc, "label" | "theme">>
): Promise<MenuDoc> {
  return db.updateDocument<MenuDoc>(DB_ID, COLLECTIONS.MENUS, menuId, data);
}

// ── Delete a menu (also deletes categories and items) ─────────
export async function deleteMenu(menuId: string): Promise<void> {
  // Delete all items in all categories first
  const categories = await listCategoriesByMenu(menuId);
  for (const cat of categories) {
    await deleteCategoryWithItems(cat.$id);
  }
  await db.deleteDocument(DB_ID, COLLECTIONS.MENUS, menuId);
}

// ── Get full menu with categories + items ─────────────────────
export async function getMenuWithCategories(menuId: string): Promise<MenuConfig> {
  const menu       = await db.getDocument<MenuDoc>(DB_ID, COLLECTIONS.MENUS, menuId);
  const categories = await listCategoriesByMenu(menuId);

  // Fetch items for all categories in parallel
  const itemsMap: Record<string, MenuItemDoc[]> = {};
  await Promise.all(
    categories.map(async (cat) => {
      itemsMap[cat.$id] = await listItemsByCategory(cat.$id);
    })
  );

  return buildMenuConfig(menu, categories, itemsMap);
}

// ── Get menu by venue slug (used by /menu page) ───────────────
export async function getMenuByVenueSlug(venueSlug: string): Promise<MenuConfig | null> {
  const venues = await db.listDocuments<VenueDoc>(DB_ID, COLLECTIONS.VENUES, [
    Query.equal("slug", venueSlug),
    Query.equal("is_active", true),
  ]);
  const venue = venues.documents[0];
  if (!venue) return null;
  return getMenuWithCategories(venue.menu_id);
}

// ── Get menu by event ID (overrides venue menu when use_own_menu=true) ──
export async function getMenuByEventId(eventId: string): Promise<MenuConfig | null> {
  const event = await db.getDocument<EventDoc>(DB_ID, COLLECTIONS.EVENTS, eventId);
  if (!event.use_own_menu || !event.menu_id) return null;
  return getMenuWithCategories(event.menu_id);
}

// ── List all menus ────────────────────────────────────────────
export async function listMenus(): Promise<MenuDoc[]> {
  const res = await db.listDocuments<MenuDoc>(DB_ID, COLLECTIONS.MENUS);
  return res.documents;
}


// ═════════════════════════════════════════════════════════════
// MENU CATEGORY ACTIONS
// ═════════════════════════════════════════════════════════════

export async function listCategoriesByMenu(menuId: string): Promise<MenuCategoryDoc[]> {
  const res = await db.listDocuments<MenuCategoryDoc>(DB_ID, COLLECTIONS.MENU_CATEGORIES, [
    Query.equal("menu_id", menuId),
    Query.orderAsc("sort_order"),
  ]);
  return res.documents;
}

export async function createCategory(data: {
  menu_id:    string;
  name:       string;
  sort_order: number;
}): Promise<MenuCategoryDoc> {
  return db.createDocument<MenuCategoryDoc>(
    DB_ID, COLLECTIONS.MENU_CATEGORIES, ID.unique(), data
  );
}

export async function updateCategory(
  categoryId: string,
  data: Partial<Pick<MenuCategoryDoc, "name" | "sort_order">>
): Promise<MenuCategoryDoc> {
  return db.updateDocument<MenuCategoryDoc>(
    DB_ID, COLLECTIONS.MENU_CATEGORIES, categoryId, data
  );
}

export async function deleteCategoryWithItems(categoryId: string): Promise<void> {
  const items = await listItemsByCategory(categoryId);
  await Promise.all(items.map((i) => deleteMenuItem(i.$id)));
  await db.deleteDocument(DB_ID, COLLECTIONS.MENU_CATEGORIES, categoryId);
}


// ═════════════════════════════════════════════════════════════
// MENU ITEM ACTIONS
// ═════════════════════════════════════════════════════════════

export async function listItemsByCategory(categoryId: string): Promise<MenuItemDoc[]> {
  const res = await db.listDocuments<MenuItemDoc>(DB_ID, COLLECTIONS.MENU_ITEMS, [
    Query.equal("category_id", categoryId),
    Query.orderAsc("sort_order"),
  ]);
  return res.documents;
}

export async function createMenuItem(data: {
  category_id:  string;
  name:         string;
  description:  string;
  price:        number;
  is_veg:       boolean;
  is_available: boolean;
  sort_order:   number;
}): Promise<MenuItemDoc> {
  return db.createDocument<MenuItemDoc>(
    DB_ID, COLLECTIONS.MENU_ITEMS, ID.unique(), data
  );
}

export async function updateMenuItem(
  itemId: string,
  data: Partial<Omit<MenuItemDoc, "$id" | "$createdAt" | "$updatedAt" | "category_id">>
): Promise<MenuItemDoc> {
  return db.updateDocument<MenuItemDoc>(
    DB_ID, COLLECTIONS.MENU_ITEMS, itemId, data
  );
}

export async function toggleItemAvailability(
  itemId: string,
  isAvailable: boolean
): Promise<MenuItemDoc> {
  return db.updateDocument<MenuItemDoc>(
    DB_ID, COLLECTIONS.MENU_ITEMS, itemId, { is_available: isAvailable }
  );
}

export async function deleteMenuItem(itemId: string): Promise<void> {
  await db.deleteDocument(DB_ID, COLLECTIONS.MENU_ITEMS, itemId);
}


// ═════════════════════════════════════════════════════════════
// VENUE ACTIONS
// ═════════════════════════════════════════════════════════════

export async function listVenues(): Promise<VenueDoc[]> {
  const res = await db.listDocuments<VenueDoc>(DB_ID, COLLECTIONS.VENUES);
  return res.documents;
}

export async function getVenue(venueId: string): Promise<VenueDoc> {
  return db.getDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, venueId);
}

export async function getVenueBySlug(slug: string): Promise<VenueDoc | null> {
  const res = await db.listDocuments<VenueDoc>(DB_ID, COLLECTIONS.VENUES, [
    Query.equal("slug", slug),
  ]);
  return res.documents[0] ?? null;
}

// Creates a new venue AND creates a fresh blank menu for it.
// Returns both so the admin can immediately start adding items.
export async function createVenue(data: {
  name:        string;
  slug:        string;
  description: string;
  theme:       string;   // used to create the paired menu
}): Promise<{ venue: VenueDoc; menu: MenuDoc }> {
  // 1. Create the paired menu first
  const menu = await createMenu({
    label: `${data.name} Menu`,
    theme: data.theme,
  });

  // 2. Create the venue linked to that menu
  const venue = await db.createDocument<VenueDoc>(
    DB_ID, COLLECTIONS.VENUES, ID.unique(),
    {
      name:        data.name,
      slug:        data.slug,
      description: data.description,
      menu_id:     menu.$id,
      is_active:   true,
    }
  );

  return { venue, menu };
}

export async function updateVenue(
  venueId: string,
  data: Partial<Pick<VenueDoc, "name" | "slug" | "description" | "menu_id" | "is_active">>
): Promise<VenueDoc> {
  return db.updateDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, venueId, data);
}

export async function toggleVenueActive(
  venueId: string,
  isActive: boolean
): Promise<VenueDoc> {
  return db.updateDocument<VenueDoc>(
    DB_ID, COLLECTIONS.VENUES, venueId, { is_active: isActive }
  );
}

// Deletes venue + all its tables, seats, and QR codes
export async function deleteVenue(venueId: string): Promise<void> {
  const tables = await listTablesByVenue(venueId);
  for (const table of tables) {
    await deleteTableWithSeats(table.$id);
  }
  await db.deleteDocument(DB_ID, COLLECTIONS.VENUES, venueId);
}


// ═════════════════════════════════════════════════════════════
// TABLE ACTIONS
// ═════════════════════════════════════════════════════════════

export async function listTablesByVenue(venueId: string): Promise<TableDoc[]> {
  const res = await db.listDocuments<TableDoc>(DB_ID, COLLECTIONS.TABLES, [
    Query.equal("venue_id", venueId),
    Query.orderAsc("table_number"),
  ]);
  return res.documents;
}

// Creates table + auto-generates seat docs for every seat
export async function createTable(data: {
  venue_id:     string;
  table_number: number;
  seat_count:   number;
}): Promise<{ table: TableDoc; seats: SeatDoc[] }> {
  const table = await db.createDocument<TableDoc>(
    DB_ID, COLLECTIONS.TABLES, ID.unique(),
    { ...data, is_active: true }
  );
  const seats = await generateSeatsForTable(table.$id, data.seat_count);
  return { table, seats };
}

export async function updateTable(
  tableId: string,
  data: Partial<Pick<TableDoc, "table_number" | "seat_count" | "is_active">>
): Promise<TableDoc> {
  return db.updateDocument<TableDoc>(DB_ID, COLLECTIONS.TABLES, tableId, data);
}

export async function toggleTableActive(
  tableId: string,
  isActive: boolean
): Promise<TableDoc> {
  return db.updateDocument<TableDoc>(
    DB_ID, COLLECTIONS.TABLES, tableId, { is_active: isActive }
  );
}

// Deletes table + all its seats + all QR codes for those seats
export async function deleteTableWithSeats(tableId: string): Promise<void> {
  const seats = await listSeatsByTable(tableId);
  for (const seat of seats) {
    await deleteSeatWithQR(seat.$id);
  }
  await db.deleteDocument(DB_ID, COLLECTIONS.TABLES, tableId);
}


// ═════════════════════════════════════════════════════════════
// SEAT ACTIONS
// ═════════════════════════════════════════════════════════════

export async function listSeatsByTable(tableId: string): Promise<SeatDoc[]> {
  const res = await db.listDocuments<SeatDoc>(DB_ID, COLLECTIONS.SEATS, [
    Query.equal("table_id", tableId),
    Query.orderAsc("seat_number"),
  ]);
  return res.documents;
}

// Auto-creates N seat docs for a table (called by createTable)
export async function generateSeatsForTable(
  tableId: string,
  seatCount: number
): Promise<SeatDoc[]> {
  const seats = await Promise.all(
    Array.from({ length: seatCount }, (_, i) =>
      db.createDocument<SeatDoc>(DB_ID, COLLECTIONS.SEATS, ID.unique(), {
        table_id:    tableId,
        seat_number: i + 1,
      })
    )
  );
  return seats;
}

export async function deleteSeatWithQR(seatId: string): Promise<void> {
  // Delete associated QR code first
  const qrs = await db.listDocuments<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, [
    Query.equal("seat_id", seatId),
  ]);
  await Promise.all(qrs.documents.map((qr: any) => deleteQRCode(qr.$id)));
  await db.deleteDocument(DB_ID, COLLECTIONS.SEATS, seatId);
}


// ═════════════════════════════════════════════════════════════
// QR CODE ACTIONS
// ═════════════════════════════════════════════════════════════

// Generates a QR code doc for a seat.
// slug format: <venueSlug>-t<tableNumber>-s<seatNumber>
// e.g. "restaurant-t3-s2-x7k4p"
export async function generateQRCodeForSeat(data: {
  seatId:      string;
  venueSlug:   string;
  tableNumber: number;
  seatNumber:  number;
  eventId?:    string | null;
}): Promise<QRCodeDoc> {
  const slug        = makeSlug(`${data.venueSlug}-t${data.tableNumber}-s${data.seatNumber}`);
  const resolvedUrl = getQRTargetUrl(data.venueSlug, slug);

  return db.createDocument<QRCodeDoc>(
    DB_ID, COLLECTIONS.QR_CODES, ID.unique(),
    {
      seat_id:      data.seatId,
      event_id:     data.eventId ?? null,
      slug,
      qr_image_url: null,       // filled in after image is uploaded
      resolved_url: resolvedUrl,
      generated_at: null,
      is_active:    true,
    }
  );
}

// Generates QR codes for every seat in a table at once
export async function generateQRCodesForTable(data: {
  tableId:     string;
  venueSlug:   string;
  tableNumber: number;
  eventId?:    string | null;
}): Promise<QRCodeDoc[]> {
  const seats = await listSeatsByTable(data.tableId);
  return Promise.all(
    seats.map((seat) =>
      generateQRCodeForSeat({
        seatId:      seat.$id,
        venueSlug:   data.venueSlug,
        tableNumber: data.tableNumber,
        seatNumber:  seat.seat_number,
        eventId:     data.eventId,
      })
    )
  );
}

// Generates QR codes for every table/seat in a venue at once
export async function generateQRCodesForVenue(venueId: string): Promise<QRCodeDoc[]> {
  const venue  = await getVenue(venueId);
  const tables = await listTablesByVenue(venueId);
  const allQRs: QRCodeDoc[] = [];

  for (const table of tables) {
    const qrs = await generateQRCodesForTable({
      tableId:     table.$id,
      venueSlug:   venue.slug,
      tableNumber: table.table_number,
    });
    allQRs.push(...qrs);
  }

  return allQRs;
}

// Stores the QR image file in Appwrite Storage and links it back
// to the qr_codes doc. Call this after the image is generated
// on the client or via a service.
export async function uploadQRImage(
  qrCodeId: string,
  imageBlob: Blob,
  fileName:  string
): Promise<QRCodeDoc> {
  const file = await storage.createFile(
    BUCKETS.QR_IMAGES,
    ID.unique(),
    new File([imageBlob], fileName, { type: "image/png" })
  );

  const imageUrl = `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${BUCKETS.QR_IMAGES}/files/${file.$id}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;

  return db.updateDocument<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, qrCodeId, {
    qr_image_url: imageUrl,
    generated_at: new Date().toISOString(),
  });
}

// Toggles a QR code active/inactive (deactivate without deleting)
export async function toggleQRCodeActive(
  qrCodeId: string,
  isActive:  boolean
): Promise<QRCodeDoc> {
  return db.updateDocument<QRCodeDoc>(
    DB_ID, COLLECTIONS.QR_CODES, qrCodeId, { is_active: isActive }
  );
}

export async function deleteQRCode(qrCodeId: string): Promise<void> {
  await db.deleteDocument(DB_ID, COLLECTIONS.QR_CODES, qrCodeId);
}

// Resolves a QR slug to a venue/event URL.
// Called by /qr/[slug]/page.tsx on every scan.
export async function resolveQRSlug(slug: string): Promise<{
  venueSlug:   string;
  seatId:      string;
  eventId:     string | null;
  resolvedUrl: string;
} | null> {
  const res = await db.listDocuments<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, [
    Query.equal("slug", slug),
    Query.equal("is_active", true),
  ]);
  const qr = res.documents[0];
  if (!qr) return null;

  // Look up seat → table → venue
  const seat  = await db.getDocument<SeatDoc>(DB_ID, COLLECTIONS.SEATS, qr.seat_id);
  const table = await db.getDocument<TableDoc>(DB_ID, COLLECTIONS.TABLES, seat.table_id);
  const venue = await db.getDocument<VenueDoc>(DB_ID, COLLECTIONS.VENUES, table.venue_id);

  // Check for an active event at this venue that overrides the menu
  let eventId: string | null = qr.event_id;
  if (!eventId) {
    const activeEvent = await getActiveEventForVenue(venue.$id);
    if (activeEvent?.use_own_menu) eventId = activeEvent.$id;
  }

  return {
    venueSlug:   venue.slug,
    seatId:      qr.seat_id,
    eventId,
    resolvedUrl: qr.resolved_url,
  };
}

export async function listQRCodesByVenue(venueId: string): Promise<QRCodeWithSeat[]> {
  const tables = await listTablesByVenue(venueId);
  const venue  = await getVenue(venueId);
  const result: QRCodeWithSeat[] = [];

  for (const table of tables) {
    const seats = await listSeatsByTable(table.$id);
    for (const seat of seats) {
      const qrs = await db.listDocuments<QRCodeDoc>(DB_ID, COLLECTIONS.QR_CODES, [
        Query.equal("seat_id", seat.$id),
      ]);
      for (const qr of qrs.documents) {
        result.push({ ...qr, seat, table, venue });
      }
    }
  }

  return result;
}


// ═════════════════════════════════════════════════════════════
// EVENT ACTIONS
// ═════════════════════════════════════════════════════════════

export async function listEvents(filters?: {
  venueId?: string;
  status?:  "upcoming" | "active" | "past";
}): Promise<EventDoc[]> {
  const queries: string[] = [];

  if (filters?.venueId) {
    queries.push(Query.equal("venue_id", filters.venueId));
  }

  const now = new Date().toISOString();
  if (filters?.status === "active") {
    queries.push(Query.lessThanEqual("starts_at", now));
    queries.push(Query.greaterThanEqual("ends_at", now));
  } else if (filters?.status === "upcoming") {
    queries.push(Query.greaterThan("starts_at", now));
  } else if (filters?.status === "past") {
    queries.push(Query.lessThan("ends_at", now));
  }

  const res = await db.listDocuments<EventDoc>(DB_ID, COLLECTIONS.EVENTS, queries);
  return res.documents;
}

// Gets the currently active event at a venue (if any)
export async function getActiveEventForVenue(venueId: string): Promise<EventDoc | null> {
  const now = new Date().toISOString();
  const res = await db.listDocuments<EventDoc>(DB_ID, COLLECTIONS.EVENTS, [
    Query.equal("venue_id", venueId),
    Query.equal("is_active", true),
    Query.lessThanEqual("starts_at", now),
    Query.greaterThanEqual("ends_at", now),
  ]);
  return res.documents[0] ?? null;
}

// Creates an event. If use_own_menu is true and no menu_id is
// provided, a blank event menu is auto-created.
export async function createEvent(data: {
  venue_id:     string;
  name:         string;
  starts_at:    string;
  ends_at:      string;
  use_own_menu: boolean;
  menu_id?:     string;   // supply if linking to an existing menu
}): Promise<{ event: EventDoc; menu: MenuDoc | null }> {
  let menuId   = data.menu_id ?? null;
  let menuDoc: MenuDoc | null = null;

  // Auto-create a blank menu if the event has its own menu
  if (data.use_own_menu && !menuId) {
    menuDoc = await createMenu({
      label: `${data.name} Menu`,
      theme: "event",
    });
    menuId = menuDoc.$id;
  }

  const slug = makeSlug(data.name);

  const event = await db.createDocument<EventDoc>(
    DB_ID, COLLECTIONS.EVENTS, ID.unique(),
    {
      venue_id:     data.venue_id,
      menu_id:      menuId,
      name:         data.name,
      slug,
      starts_at:    data.starts_at,
      ends_at:      data.ends_at,
      use_own_menu: data.use_own_menu,
      is_active:    true,
    }
  );

  return { event, menu: menuDoc };
}

export async function updateEvent(
  eventId: string,
  data: Partial<Pick<EventDoc,
    "name" | "starts_at" | "ends_at" | "use_own_menu" | "menu_id" | "is_active"
  >>
): Promise<EventDoc> {
  return db.updateDocument<EventDoc>(DB_ID, COLLECTIONS.EVENTS, eventId, data);
}

export async function toggleEventActive(
  eventId:  string,
  isActive: boolean
): Promise<EventDoc> {
  return db.updateDocument<EventDoc>(
    DB_ID, COLLECTIONS.EVENTS, eventId, { is_active: isActive }
  );
}

export async function deleteEvent(eventId: string): Promise<void> {
  await db.deleteDocument(DB_ID, COLLECTIONS.EVENTS, eventId);
}


// ═════════════════════════════════════════════════════════════
// MENU PAGE (guest-facing read queries)
// ═════════════════════════════════════════════════════════════

// Called by /menu/page.tsx to resolve a venue slug to a MenuConfig.
// If an active event with use_own_menu is running, returns that
// menu instead of the venue's default.
export async function resolveMenuForVenue(venueSlug: string): Promise<{
  menuConfig: MenuConfig;
  isEvent:    boolean;
  eventId:    string | null;
} | null> {
  const venue = await getVenueBySlug(venueSlug);
  if (!venue) return null;

  // Check for an overriding active event
  const activeEvent = await getActiveEventForVenue(venue.$id);
  if (activeEvent?.use_own_menu && activeEvent.menu_id) {
    const menuConfig = await getMenuWithCategories(activeEvent.menu_id);
    return { menuConfig, isEvent: true, eventId: activeEvent.$id };
  }

  // Fall back to the venue's own menu
  const menuConfig = await getMenuWithCategories(venue.menu_id);
  return { menuConfig, isEvent: false, eventId: null };
}

// Called by /menu/page.tsx when venue param is event_<id>
export async function resolveMenuForEvent(eventId: string): Promise<MenuConfig | null> {
  const event = await db.getDocument<EventDoc>(DB_ID, COLLECTIONS.EVENTS, eventId);
  if (!event.use_own_menu || !event.menu_id) {
    // No custom menu — fall back to venue menu
    const venue = await getVenue(event.venue_id);
    return getMenuWithCategories(venue.menu_id);
  }
  return getMenuWithCategories(event.menu_id);
}