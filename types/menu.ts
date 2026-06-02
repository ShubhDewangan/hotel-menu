// ─────────────────────────────────────────────────────────────
// MenuTheme
// One value per venue; drives visual styling in the UI layer.
// Add new values here as new venues / themes are created.
// ─────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────
// VenueTheme — themes that have a static menu in menuData.
// MenuTheme  — all themes including dynamic event menus.
// ─────────────────────────────────────────────────────────────
export type VenueTheme = "restaurant" | "pool" | "lobby";
export type MenuTheme  = VenueTheme | "event";

// ─────────────────────────────────────────────────────────────
// UI / config shapes
// These are the flattened, presentation-ready versions used by
// app/menu/page.tsx (and any other UI consumer).  They contain
// only what the renderer needs — no Appwrite metadata.
// ─────────────────────────────────────────────────────────────

export interface MenuItemConfig {
  image: any;
  name:        string;
  description: string;
  price:       number;
  isVeg:       boolean;
  isAvailable: boolean;
  sortOrder:   number;
}

/**
 * Presentation-layer alias used directly by card / list components.
 * Identical shape to MenuItemConfig — one name for data-layer
 * consumers, one for UI components.
 */
export type MenuItem = MenuItemConfig;

export interface MenuCategoryConfig {
  name:      string;
  sortOrder: number;
  items:     MenuItemConfig[];
}

/**
 * Presentation-layer alias used directly by view / layout components.
 * Identical shape to MenuCategoryConfig.
 */
export type MenuCategory = MenuCategoryConfig;

export interface MenuConfig {
  theme:      VenueTheme;
  label:      string;
  categories: MenuCategoryConfig[];
}