/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import {
  listMenus, listCategoriesByMenu, listItemsByCategory,
  createCategory, deleteCategoryWithItems,
  createMenuItem, updateMenuItem, toggleItemAvailability, deleteMenuItem,
} from "@/lib/actions/admin.actions";
import type { MenuDoc, MenuCategoryDoc, MenuItemDoc } from "@/types/appwrite";
import { Suspense } from 'react'

type NewMenuItemData = Omit<MenuItemDoc, "$id" | "$collectionId" | "$databaseId" | "$createdAt" | "$updatedAt" | "$permissions" | "$sequence">;
type ItemsMap = Record<string, MenuItemDoc[] | null>;

const ACCENT: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#d4af6a",
  lobby:      "#d4af6a",
  event:      "#b07fd4",
};

function MenusContent() {
  const searchParams  = useSearchParams();
  const menuIdFromUrl = searchParams.get("menuId");

  const [menus, setMenus]             = useState<MenuDoc[]>([]);
  const [activeMenuId, setActiveMenu] = useState<string | null>(null);
  const [categories, setCategories]   = useState<Record<string, MenuCategoryDoc[] | null>>({});
  const [items, setItems]             = useState<ItemsMap>({});
  const [loading, setLoading]         = useState(true);
  const [loadingCats, setLoadingCats] = useState<string | null>(null);
  const [loadingItems, setLoadingItm] = useState<string | null>(null);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItemDoc | null>(null);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [showAddCat, setShowAddCat]   = useState(false);

  useEffect(() => {
    listMenus().then((ms) => {
      setMenus(ms);
      const target = menuIdFromUrl ?? (ms.length > 0 ? ms[0].$id : null);
      if (target) setActiveMenu(target);
      setLoading(false);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!activeMenuId) return;
    if (categories[activeMenuId] !== undefined) return;
    setLoadingCats(activeMenuId);
    listCategoriesByMenu(activeMenuId).then((cats) => {
      setCategories((p) => ({ ...p, [activeMenuId]: cats }));
      setLoadingCats(null);
    });
  }, [activeMenuId]); // eslint-disable-line

  const handleExpandCat = async (catId: string) => {
    if (expandedCat === catId) { setExpandedCat(null); return; }
    setExpandedCat(catId);
    if (items[catId] !== undefined) return;
    setLoadingItm(catId);
    const its = await listItemsByCategory(catId);
    setItems((p) => ({ ...p, [catId]: its }));
    setLoadingItm(null);
  };

  const activeMenu = menus.find((m) => m.$id === activeMenuId);
  const activeCats = activeMenuId ? (categories[activeMenuId] ?? []) : [];
  const accent     = activeMenu ? (ACCENT[activeMenu.theme] ?? "#c9a84c") : "#c9a84c";

  const totalItems = activeCats.reduce((s, c) => s + (items[c.$id]?.length ?? 0), 0);
  const available  = activeCats.reduce((s, c) => s + (items[c.$id]?.filter((i) => i.is_available).length ?? 0), 0);

  const handleToggleItem = async (catId: string, itemId: string, current: boolean) => {
    await toggleItemAvailability(itemId, !current);
    setItems((p) => ({ ...p, [catId]: p[catId]?.map((i) => i.$id === itemId ? { ...i, is_available: !current } : i) ?? null }));
  };

  const handleDeleteItem = async (catId: string, itemId: string) => {
    if (!confirm("Delete this item?")) return;
    await deleteMenuItem(itemId);
    setItems((p) => ({ ...p, [catId]: p[catId]?.filter((i) => i.$id !== itemId) ?? null }));
  };

  const handleDeleteCat = async (catId: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    await deleteCategoryWithItems(catId);
    setCategories((p) => ({ ...p, [activeMenuId!]: p[activeMenuId!]?.filter((c) => c.$id !== catId) ?? null }));
    setItems((p) => { const n = { ...p }; delete n[catId]; return n; });
  };

  const handleAddItem = async (catId: string, item: NewMenuItemData) => {
    const created = await createMenuItem({
      category_id: catId, name: item.name, description: item.description,
      price: item.price, is_veg: item.is_veg, is_available: true,
      sort_order: items[catId]?.length ?? 0,
    });
    setItems((p) => ({ ...p, [catId]: [...(p[catId] ?? []), created] }));
    setShowAddItem(null);
  };

  const handleAddCat = async (name: string) => {
    const created = await createCategory({ menu_id: activeMenuId!, name, sort_order: activeCats.length });
    setCategories((p) => ({ ...p, [activeMenuId!]: [...(p[activeMenuId!] ?? []), created] }));
    setItems((p) => ({ ...p, [created.$id]: [] }));
    setShowAddCat(false);
  };

  const handleSaveItem = async (itemId: string, data: Partial<Pick<MenuItemDoc, "name" | "description" | "price">>) => {
    const updated = await updateMenuItem(itemId, data);
    setItems((p) => {
      const n = { ...p };
      for (const catId in n) {
        if (n[catId]?.some((i) => i.$id === itemId)) {
          n[catId] = n[catId]!.map((i) => i.$id === itemId ? { ...i, ...updated } : i);
        }
      }
      return n;
    });
    setEditingItem(null);
  };

  if (loading) return <LoadingSpinner/>

  if (menus.length === 0) return (
    <div className="flex-1 flex items-center justify-center">
      <p className="text-white/20 text-[13px]">No menus found. Create a venue first.</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 overflow-y-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[18px] text-white/90 font-medium tracking-wide" style={{ fontFamily: "var(--font-cinzel)" }}>Menu Editor</h1>
        <p className="text-[12px] text-white/30 mt-0.5">Edit categories and items for each venue menu</p>
      </div>

      {/* Menu tabs */}
      <div className="flex gap-1.5 mb-6 flex-wrap">
        {menus.map((m) => {
          const ac     = ACCENT[m.theme] ?? "#c9a84c";
          const active = m.$id === activeMenuId;
          return (
            <button key={m.$id}
              onClick={() => { setActiveMenu(m.$id); setExpandedCat(null); setShowAddCat(false); setShowAddItem(null); }}
              className="text-[12px] px-4 py-2 rounded-xl border transition-all cursor-pointer"
              style={{
                borderColor: active ? `${ac}40` : "rgba(255,255,255,0.05)",
                background:  active ? `${ac}12`  : "transparent",
                color:       active ? ac          : "rgba(255,255,255,0.35)",
              }}>
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Categories", value: activeCats.length },
          { label: "Total Items", value: totalItems },
          { label: "Available",   value: totalItems > 0 ? `${available}/${totalItems}` : "—" },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>{s.label}</p>
            <p className="text-[22px] text-white/80 font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Loading categories */}
      {loadingCats === activeMenuId && (
        <div className="flex items-center gap-2 text-white/20 py-4">
          <Loader2 size={13} className="animate-spin" />
          <span className="text-[12px]">Loading categories…</span>
        </div>
      )}

      {/* Categories */}
      <div className="flex flex-col gap-2">
        {activeCats.map((cat) => {
          const catItems   = items[cat.$id] ?? [];
          const isExpanded = expandedCat === cat.$id;
          const isLoading  = loadingItems === cat.$id;

          return (
            <div key={cat.$id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.015] transition-colors select-none"
                onClick={() => handleExpandCat(cat.$id)}>
                <span className="text-white/25">
                  {isLoading ? <Loader2 size={14} className="animate-spin" />
                    : isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </span>
                <span className="flex-1 text-[14px] text-white/80 font-medium">{cat.name}</span>
                <span className="text-[10px] text-white/20 mr-2">
                  {items[cat.$id] !== undefined ? `${catItems.length} items` : "expand to load"}
                </span>
                <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.$id); }}
                  className="text-white/15 hover:text-red-400/60 cursor-pointer transition-colors p-1">
                  <Trash2 size={12} />
                </button>
              </div>

              {isExpanded && items[cat.$id] !== undefined && (
                <div className="border-t border-white/[0.04] px-5 py-3">
                  <div className="flex flex-col gap-1.5">
                    {catItems.map((item) => (
                      <div key={item.$id}
                        className={`flex items-center gap-3 rounded-xl px-4 py-3 border transition-colors ${item.is_available
                          ? "bg-white/[0.015] border-white/[0.04]"
                          : "bg-red-500/[0.03] border-red-500/[0.06]"}`}>
                        <div className={`w-[9px] h-[9px] rounded-[2px] border flex-shrink-0 flex items-center justify-center ${item.is_veg ? "border-green-600" : "border-red-600"}`}>
                          <div className={`w-[4px] h-[4px] rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] text-white/70">{item.name}</span>
                            {!item.is_available && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-red-500/20 text-red-400/50">Off menu</span>
                            )}
                          </div>
                          <p className="text-[11px] text-white/25 truncate mt-0.5">{item.description}</p>
                        </div>
                        <span className="text-[12px] font-medium flex-shrink-0 tabular-nums" style={{ color: accent }}>₹{item.price}</span>
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleToggleItem(cat.$id, item.$id, item.is_available)} className="cursor-pointer p-1">
                            {item.is_available
                              ? <ToggleRight size={15} className="text-green-400/50 hover:text-green-400/80" />
                              : <ToggleLeft size={15} className="text-white/15 hover:text-white/40" />}
                          </button>
                          <button onClick={() => setEditingItem(item)} className="text-white/15 hover:text-white/50 cursor-pointer p-1 transition-colors">
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteItem(cat.$id, item.$id)} className="text-white/15 hover:text-red-400/60 cursor-pointer p-1 transition-colors">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {catItems.length === 0 && (
                      <p className="text-[11px] text-white/20 italic py-1 px-1">No items yet</p>
                    )}
                  </div>

                  {showAddItem === cat.$id ? (
                    <AddItemForm sortOrder={catItems.length} accent={accent}
                      onClose={() => setShowAddItem(null)}
                      onAdd={(item) => handleAddItem(cat.$id, { ...item, category_id: cat.$id })} />
                  ) : (
                    <button onClick={() => setShowAddItem(cat.$id)}
                      className="flex items-center gap-1.5 text-[11px] mt-3 px-2 py-1.5 rounded-lg cursor-pointer transition-colors hover:bg-white/[0.03]"
                      style={{ color: `${accent}70` }}>
                      <Plus size={11} /> Add Item
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add category */}
      {showAddCat ? (
        <AddCategoryForm accent={accent} onClose={() => setShowAddCat(false)} onAdd={handleAddCat} />
      ) : (
        <button onClick={() => setShowAddCat(true)}
          className="flex items-center gap-2 mt-3 text-[12px] bg-white/[0.015] hover:bg-white/[0.03] border border-dashed border-white/[0.06] hover:border-white/[0.1] text-white/25 hover:text-white/50 px-4 py-3 rounded-2xl w-full justify-center transition-all cursor-pointer">
          <Plus size={13} /> Add Category
        </button>
      )}

      {editingItem && (
        <EditItemModal item={editingItem} accent={accent}
          onClose={() => setEditingItem(null)} onSave={handleSaveItem} />
      )}
    </div>
  );
}

function AddItemForm({ sortOrder, accent, onClose, onAdd }: {
  sortOrder: number; accent: string;
  onClose: () => void;
  onAdd: (item: NewMenuItemData) => Promise<void>;
}) {
  const [name, setName]     = useState("");
  const [desc, setDesc]     = useState("");
  const [price, setPrice]   = useState("");
  const [isVeg, setIsVeg]   = useState(true);
  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-3 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-white/25">Item name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Paneer Tikka"
            className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/15 outline-none focus:border-white/15" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] text-white/25">Price (₹)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="320"
            className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/15 outline-none focus:border-white/15" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-white/25">Description</label>
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Ingredients / notes"
          className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/15 outline-none focus:border-white/15" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {([true, false] as const).map((v) => (
            <button key={String(v)} onClick={() => setIsVeg(v)}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer"
              style={{
                borderColor: isVeg === v ? (v ? "#16a34a40" : "#dc262640") : "rgba(255,255,255,0.05)",
                background:  isVeg === v ? (v ? "#16a34a10" : "#dc262610") : "transparent",
                color:       isVeg === v ? (v ? "#4ade80"   : "#f87171")   : "rgba(255,255,255,0.25)",
              }}>
              <div className={`w-[6px] h-[6px] rounded-full ${v ? "bg-green-500" : "bg-red-500"}`} />
              {v ? "Veg" : "Non-veg"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => { if (!name || !price) return; setSaving(true); await onAdd({ category_id: "", name, description: desc, price: parseFloat(price), is_veg: isVeg, is_available: true, sort_order: sortOrder }); setSaving(false); }}
            disabled={saving || !name || !price}
            className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg border cursor-pointer disabled:opacity-40 transition-all"
            style={{ background: `${accent}10`, borderColor: `${accent}25`, color: accent }}>
            {saving && <Loader2 size={10} className="animate-spin" />} Add
          </button>
          <button onClick={onClose} className="text-white/20 hover:text-white/45 text-[11px] px-2 cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryForm({ accent, onClose, onAdd }: { accent: string; onClose: () => void; onAdd: (name: string) => Promise<void> }) {
  const [name, setName]     = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name, e.g. Desserts"
        autoFocus onKeyDown={(e) => { if (e.key === "Enter" && name && !saving) { setSaving(true); onAdd(name); } }}
        className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-2 text-[12px] text-white placeholder-white/15 outline-none focus:border-white/15" />
      <button onClick={async () => { if (!name) return; setSaving(true); await onAdd(name); setSaving(false); }}
        disabled={saving || !name}
        className="flex items-center gap-1.5 text-[11px] px-3 py-2 rounded-lg border cursor-pointer disabled:opacity-40 transition-all"
        style={{ background: `${accent}10`, borderColor: `${accent}25`, color: accent }}>
        {saving && <Loader2 size={10} className="animate-spin" />} Add
      </button>
      <button onClick={onClose} className="text-white/20 hover:text-white/45 text-[11px] cursor-pointer">Cancel</button>
    </div>
  );
}

function EditItemModal({ item, accent, onClose, onSave }: {
  item: MenuItemDoc; accent: string;
  onClose: () => void;
  onSave: (id: string, data: Partial<Pick<MenuItemDoc, "name" | "description" | "price">>) => Promise<void>;
}) {
  const [name, setName]     = useState(item.name);
  const [desc, setDesc]     = useState(item.description);
  const [price, setPrice]   = useState(String(item.price));
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0d0f15] border border-white/[0.07] rounded-2xl p-6 w-[420px]">
        <h2 className="text-[14px] text-white/80 mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>Edit Item</h2>
        <div className="flex flex-col gap-3.5">
          {[
            { label: "Name", value: name, onChange: setName },
            { label: "Description", value: desc, onChange: setDesc },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-white/30">{f.label}</label>
              <input value={f.value} onChange={(e) => f.onChange(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15" />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/30">Price (₹)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={async () => { setSaving(true); await onSave(item.$id, { name, description: desc, price: parseFloat(price) }); setSaving(false); }}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border text-[13px] cursor-pointer disabled:opacity-50 transition-all"
            style={{ background: `${accent}10`, borderColor: `${accent}25`, color: accent }}>
            {saving && <Loader2 size={13} className="animate-spin" />} Save
          </button>
          <button onClick={onClose} className="px-4 text-white/25 hover:text-white/50 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3 text-white/20">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px]">Loading…</span>
      </div>
    </div>
  );
}

export default function MenusPage() {
  return (
    <Suspense fallback={<LoadingSpinner/>}>
      <MenusContent/>
    </Suspense>
  )
}