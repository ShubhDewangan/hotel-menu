// ─────────────────────────────────────────────────────────────
// types/appwrite.ts
//
// Exact mirror of every Appwrite collection schema.
// Field names use snake_case to match the Appwrite attribute names.
// Import these everywhere instead of ad-hoc inline types.
// ─────────────────────────────────────────────────────────────

import { Models } from "appwrite";

// All collection types extend Models.Document — the Appwrite SDK's
// own base type — so they satisfy the generic constraint on
// db.createDocument<T>, db.getDocument<T>, etc.

// ─────────────────────────────────────────────────────────────
// menus
// ─────────────────────────────────────────────────────────────
export interface MenuDoc extends Models.Document {
  label: string;
  theme: string;
}

// ─────────────────────────────────────────────────────────────
// menu_categories
// ─────────────────────────────────────────────────────────────
export interface MenuCategoryDoc extends Models.Document {
  menu_id:    string;
  name:       string;
  sort_order: number;
}

// ─────────────────────────────────────────────────────────────
// menu_items
// ─────────────────────────────────────────────────────────────
export interface MenuItemDoc extends Models.Document {
  category_id:  string;
  name:         string;
  description:  string;
  price:        number;
  is_veg:       boolean;
  is_available: boolean;
  sort_order:   number;
}

// ─────────────────────────────────────────────────────────────
// venues
// ─────────────────────────────────────────────────────────────
export interface VenueDoc extends Models.Document {
  name:        string;
  slug:        string;
  description: string;
  menu_id:     string;
  is_active:   boolean;
}

// ─────────────────────────────────────────────────────────────
// tables
// ─────────────────────────────────────────────────────────────
export interface TableDoc extends Models.Document {
  venue_id:     string;
  table_number: number;
  seat_count:   number;
  is_active:    boolean;
}

// ─────────────────────────────────────────────────────────────
// seats
// ─────────────────────────────────────────────────────────────
export interface SeatDoc extends Models.Document {
  table_id:    string;
  seat_number: number;
}

// ─────────────────────────────────────────────────────────────
// qr_codes
// ─────────────────────────────────────────────────────────────
export interface QRCodeDoc extends Models.Document {
  table_id:     string;
  seat_id:      string | null;
  event_id:     string | null;
  slug:         string;
  qr_image_url: string | null;
  file_id:      string | null;
  resolved_url: string;
  generated_at: string | null;
  is_active:    boolean;
}

// ─────────────────────────────────────────────────────────────
// events
// ─────────────────────────────────────────────────────────────
export interface EventDoc extends Models.Document {
  venue_id:     string;
  menu_id:      string | null;
  name:         string;
  slug:         string;
  starts_at:    string;
  ends_at:      string;
  use_own_menu: boolean;
  is_active:    boolean;
}

// ─────────────────────────────────────────────────────────────
// Composed / joined shapes
// ─────────────────────────────────────────────────────────────

export interface MenuWithCategories extends MenuDoc {
  categories: (MenuCategoryDoc & { items: MenuItemDoc[] })[];
}

export interface VenueWithTables extends VenueDoc {
  tables: TableDoc[];
}

export interface QRCodeWithTable extends QRCodeDoc {
  table: TableDoc;
  venue: VenueDoc;
}

// Keep for backward compat
export type QRCodeWithSeat = QRCodeWithTable;