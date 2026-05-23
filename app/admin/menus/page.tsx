"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import {
  listMenus,
  listCategoriesByMenu,
  listItemsByCategory,
  createCategory,
  updateCategory,
  deleteCategoryWithItems,
  createMenuItem,
  updateMenuItem,
  toggleItemAvailability,
  deleteMenuItem,
} from "@/lib/actions/admin.actions";

import type { MenuDoc, MenuCategoryDoc, MenuItemDoc } from "@/types/appwrite";

type NewMenuItemData = Omit<MenuItemDoc, "$id" | "$collectionId" | "$databaseId" | "$createdAt" | "$updatedAt" | "$permissions" | "$sequence">;

const themeAccent: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#d4af6a",
  lobby:      "#d4af6a",
  event:      "#b07fd4",
};

type FullMenu = MenuDoc & {
  categories: (MenuCategoryDoc & { items: MenuItemDoc[] })[];
};

export default function MenusPage() {
  const [menus, setMenus]             = useState<FullMenu[]>([]);
  const [activeMenuId, setActiveMenu] = useState<string | null>(null);
  const [loading, setLoading]         = useState(true);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemDoc | null>(null);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [showAddCat, setShowAddCat]   = useState(false);
  const [isPending, startTransition]  = useTransition();

  const load = async () => {
    setLoading(true);
    try {
      const ms = await listMenus();
      const full: FullMenu[] = await Promise.all(
        ms.map(async (m) => {
          const cats = await listCategoriesByMenu(m.$id);
          const categories = await Promise.all(
            cats.map(async (cat) => ({
              ...cat,
              items: await listItemsByCategory(cat.$id),
            }))
          );
          return { ...m, categories };
        })
      );
      setMenus(full);
      if (full.length > 0) {
        setActiveMenu(full[0].$id);
        if (full[0].categories.length > 0) setExpandedCat(full[0].categories[0].$id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const activeMenu = menus.find((m) => m.$id === activeMenuId) ?? menus[0];
  const accent     = activeMenu ? (themeAccent[activeMenu.theme] ?? "#c9a84c") : "#c9a84c";

  const handleToggleItem = (catId: string, itemId: string, current: boolean) => {
    startTransition(async () => {
      await toggleItemAvailability(itemId, !current);
      setMenus((p) =>
        p.map((m) =>
          m.$id === activeMenuId
            ? {
                ...m,
                categories: m.categories.map((c) =>
                  c.$id === catId
                    ? { ...c, items: c.items.map((i) => i.$id === itemId ? { ...i, is_available: !current } : i) }
                    : c
                ),
              }
            : m
        )
      );
    });
  };

  const handleDeleteItem = (catId: string, itemId: string) => {
    if (!confirm("Delete this item?")) return;
    startTransition(async () => {
      await deleteMenuItem(itemId);
      setMenus((p) =>
        p.map((m) =>
          m.$id === activeMenuId
            ? { ...m, categories: m.categories.map((c) => c.$id === catId ? { ...c, items: c.items.filter((i) => i.$id !== itemId) } : c) }
            : m
        )
      );
    });
  };

  const handleDeleteCategory = (catId: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    startTransition(async () => {
      await deleteCategoryWithItems(catId);
      setMenus((p) =>
        p.map((m) =>
          m.$id === activeMenuId
            ? { ...m, categories: m.categories.filter((c) => c.$id !== catId) }
            : m
        )
      );
    });
  };

  const handleAddItem = async (catId: string, item: NewMenuItemData) => {
    const created = await createMenuItem({
      category_id:  catId,
      name:         item.name,
      description:  item.description,
      price:        item.price,
      is_veg:       item.is_veg,
      is_available: true,
      sort_order:   item.sort_order,
    });
    setMenus((p) =>
      p.map((m) =>
        m.$id === activeMenuId
          ? { ...m, categories: m.categories.map((c) => c.$id === catId ? { ...c, items: [...c.items, created] } : c) }
          : m
      )
    );
    setShowAddItem(null);
  };

  const handleAddCategory = async (name: string) => {
    const existing = activeMenu?.categories ?? [];
    const created = await createCategory({
      menu_id:    activeMenuId!,
      name,
      sort_order: existing.length,
    });
    setMenus((p) =>
      p.map((m) =>
        m.$id === activeMenuId
          ? { ...m, categories: [...m.categories, { ...created, items: [] }] }
          : m
      )
    );
    setShowAddCat(false);
  };

  const handleSaveItem = async (itemId: string, data: Partial<Pick<MenuItemDoc, "name" | "description" | "price">>) => {
    const updated = await updateMenuItem(itemId, data);
    setMenus((p) =>
      p.map((m) => ({
        ...m,
        categories: m.categories.map((c) => ({
          ...c,
          items: c.items.map((i) => i.$id === itemId ? { ...i, ...updated } : i),
        })),
      }))
    );
    setEditingItem(null);
  };

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-white/30">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-[13px]">Loading menus…</span>
    </div>
  );

  if (!activeMenu) return (
    <div className="p-8 text-white/30 text-[13px]">No menus found. Create a venue first to auto-generate menus.</div>
  );

  const totalItems = activeMenu.categories.reduce((s, c) => s + c.items.length, 0);
  const available  = activeMenu.categories.reduce((s, c) => s + c.items.filter((i) => i.is_available).length, 0);

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl text-white font-medium" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
            Menu Editor
          </h1>
          <p className="text-[13px] text-white/40 mt-1">Edit categories and items for each venue menu</p>
        </div>
      </div>

      {/* Menu tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {menus.map((m) => {
          const ac     = themeAccent[m.theme] ?? "#c9a84c";
          const active = m.$id === activeMenuId;
          return (
            <button
              key={m.$id}
              onClick={() => { setActiveMenu(m.$id); setExpandedCat(null); }}
              className="text-[12px] px-4 py-2 rounded-lg border transition-all cursor-pointer"
              style={{
                borderColor: active ? `${ac}50` : "rgba(255,255,255,0.06)",
                background:  active ? `${ac}15`  : "transparent",
                color:       active ? ac          : "rgba(255,255,255,0.4)",
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Categories", value: activeMenu.categories.length },
          { label: "Total Items", value: totalItems },
          { label: "Available",   value: `${available}/${totalItems}` },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>{s.label}</p>
            <p className="text-2xl text-white font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Categories */}
      <div className="flex flex-col gap-3">
        {activeMenu.categories.map((cat) => (
          <div key={cat.$id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-4">
              <button onClick={() => setExpandedCat((p) => p === cat.$id ? null : cat.$id)} className="text-white/40 hover:text-white/70 cursor-pointer">
                {expandedCat === cat.$id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <GripVertical size={14} className="text-white/20" />
              <span className="flex-1 text-[14px] text-white font-medium">{cat.name}</span>
              <span className="text-[11px] text-white/30">{cat.items.length} items</span>
              <button
                onClick={() => handleDeleteCategory(cat.$id)}
                className="text-white/30 hover:text-red-400 cursor-pointer ml-2"
                disabled={isPending}
              >
                <Trash2 size={13} />
              </button>
            </div>

            {expandedCat === cat.$id && (
              <div className="border-t border-white/[0.06] px-5 py-3">
                <div className="flex flex-col gap-2">
                  {cat.items.map((item) => (
                    <div key={item.$id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
                      <div className={`w-[10px] h-[10px] rounded-[2px] border flex-shrink-0 flex items-center justify-center ${item.is_veg ? "border-green-600" : "border-red-600"}`}>
                        <div className={`w-[4px] h-[4px] rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-white/80">{item.name}</span>
                          {!item.is_available && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-red-500/20 text-red-400/70">Unavailable</span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/30 truncate">{item.description}</p>
                      </div>
                      <span className="text-[12px] flex-shrink-0" style={{ color: accent }}>₹{item.price}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <button
                          onClick={() => handleToggleItem(cat.$id, item.$id, item.is_available)}
                          className="text-white/20 hover:text-white/50 cursor-pointer"
                          disabled={isPending}
                        >
                          {item.is_available ? <ToggleRight size={15} className="text-green-400/60" /> : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => setEditingItem(item)} className="text-white/20 hover:text-white/50 cursor-pointer">
                          <Pencil size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(cat.$id, item.$id)}
                          className="text-white/20 hover:text-red-400/70 cursor-pointer"
                          disabled={isPending}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {cat.items.length === 0 && (
                    <p className="text-[12px] text-white/20 italic py-1">No items yet</p>
                  )}
                </div>
                {showAddItem === cat.$id ? (
                  <AddItemForm
                    sortOrder={cat.items.length}
                    onClose={() => setShowAddItem(null)}
                    onAdd={(item) => handleAddItem(cat.$id, { ...item, category_id: cat.$id })}
                  />
                ) : (
                  <button
                    onClick={() => setShowAddItem(cat.$id)}
                    className="flex items-center gap-1.5 text-[11px] mt-3 cursor-pointer transition-colors"
                    style={{ color: `${accent}99` }}
                  >
                    <Plus size={12} /> Add Item
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddCat ? (
        <AddCategoryForm onClose={() => setShowAddCat(false)} onAdd={handleAddCategory} />
      ) : (
        <button
          onClick={() => setShowAddCat(true)}
          className="flex items-center gap-2 mt-4 text-[13px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] text-white/40 hover:text-white/70 px-4 py-3 rounded-xl w-full justify-center transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add Category
        </button>
      )}

      {editingItem && (
        <EditItemModal
          item={editingItem}
          accent={accent}
          onClose={() => setEditingItem(null)}
          onSave={handleSaveItem}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function AddItemForm({ sortOrder, onClose, onAdd }: {
  sortOrder: number;
  onClose: () => void;
  onAdd: (item: NewMenuItemData) => Promise<void>;
}) {
  const [name, setName]   = useState("");
  const [desc, setDesc]   = useState("");
  const [price, setPrice] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!name || !price) return;
    setSaving(true);
    await onAdd({
      category_id:  "",
      name,
      description:  desc,
      price:        parseFloat(price),
      is_veg:       isVeg,
      is_available: true,
      sort_order:   sortOrder,
    });
    setSaving(false);
  };

  return (
    <div className="mt-3 bg-white/[0.02] border border-[#c9a84c]/15 rounded-lg px-4 py-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-white/30">Item name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paneer Tikka"
            className="bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-white/30">Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g. 320"
            className="bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-white/30">Description</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ingredients / description"
          className="bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-[11px] text-white/40">Type</label>
          <div className="flex gap-2">
            {([true, false] as const).map((v) => (
              <button
                key={String(v)}
                onClick={() => setIsVeg(v)}
                className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded border transition-all cursor-pointer"
                style={{
                  borderColor: isVeg === v ? (v ? "#16a34a60" : "#dc262660") : "rgba(255,255,255,0.08)",
                  background:  isVeg === v ? (v ? "#16a34a15" : "#dc262615") : "transparent",
                  color:       isVeg === v ? (v ? "#4ade80"   : "#f87171")   : "rgba(255,255,255,0.3)",
                }}
              >
                <div className={`w-[8px] h-[8px] rounded-full ${v ? "bg-green-500" : "bg-red-500"}`} />
                {v ? "Veg" : "Non-veg"}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handle}
            disabled={saving || !name || !price}
            className="flex items-center gap-1.5 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[12px] px-3 py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 size={11} className="animate-spin" />} Add Item
          </button>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-[12px] px-3 py-1.5 cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryForm({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (name: string) => Promise<void>;
}) {
  const [name, setName]   = useState("");
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    if (!name) return;
    setSaving(true);
    await onAdd(name);
    setSaving(false);
  };

  return (
    <div className="mt-2 flex items-center gap-3 bg-white/[0.02] border border-[#c9a84c]/15 rounded-xl px-4 py-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name, e.g. Desserts"
        className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
      <button
        onClick={handle}
        disabled={saving || !name}
        className="flex items-center gap-1.5 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[12px] px-3 py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
      >
        {saving && <Loader2 size={11} className="animate-spin" />} Add
      </button>
      <button onClick={onClose} className="text-white/30 hover:text-white/60 text-[12px] cursor-pointer">Cancel</button>
    </div>
  );
}

function EditItemModal({ item, accent, onClose, onSave }: {
  item:    MenuItemDoc;
  accent:  string;
  onClose: () => void;
  onSave:  (id: string, data: Partial<Pick<MenuItemDoc, "name" | "description" | "price">>) => Promise<void>;
}) {
  const [name, setName]   = useState(item.name);
  const [desc, setDesc]   = useState(item.description);
  const [price, setPrice] = useState(String(item.price));
  const [saving, setSaving] = useState(false);

  const handle = async () => {
    setSaving(true);
    await onSave(item.$id, { name, description: desc, price: parseFloat(price) });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl p-6 w-[440px]">
        <h2 className="text-[14px] text-white mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>Edit Item</h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Item name</label>
            <input value={name} onChange={(e) => setName(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Price (₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handle}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 border text-[13px] py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            style={{ background: `${accent}15`, borderColor: `${accent}40`, color: accent }}
          >
            {saving && <Loader2 size={13} className="animate-spin" />} Save Changes
          </button>
          <button onClick={onClose} className="px-4 text-white/30 hover:text-white/60 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}