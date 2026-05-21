// ─────────────────────────────────────────────────────────────
// Appwrite base document shape
// Every document returned by Appwrite includes these fields.
// ─────────────────────────────────────────────────────────────
export interface AppwriteDocument {
  $id:           string;
  $collectionId: string;
  $databaseId:   string;
  $createdAt:    string;
  $updatedAt:    string;
  $permissions:  string[];
}

// ─────────────────────────────────────────────────────────────
// Menu
// ─────────────────────────────────────────────────────────────
export interface Menu extends AppwriteDocument {
  label: string;
  /** Matches MenuTheme in types/menu.ts */
  theme: string;
}

// ─────────────────────────────────────────────────────────────
// Category (a section inside a menu)
// ─────────────────────────────────────────────────────────────
export interface MenuCategoryDoc extends AppwriteDocument {
  menuId:    string;
  name:      string;
  sortOrder: number;
}

// ─────────────────────────────────────────────────────────────
// Item (a dish / drink inside a category)
// ─────────────────────────────────────────────────────────────
export interface MenuItemDoc extends AppwriteDocument {
  categoryId:  string;
  name:        string;
  description: string;
  price:       number;
  isVeg:       boolean;
  isAvailable: boolean;
  sortOrder:   number;
}

// ─────────────────────────────────────────────────────────────
// Composed / joined shapes (assembled in the data layer,
// not stored directly in Appwrite)
// ─────────────────────────────────────────────────────────────

/** A category with its items already resolved */
export interface MenuCategoryWithItems extends MenuCategoryDoc {
  items: MenuItemDoc[];
}

/** A menu with its categories (and their items) already resolved */
export interface MenuWithCategories extends Menu {
  categories: MenuCategoryWithItems[];
}