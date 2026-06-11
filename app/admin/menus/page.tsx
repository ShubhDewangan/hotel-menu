/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, ToggleLeft, ToggleRight, Loader2 } from "lucide-react";
import {
  listMenus, listCategoriesByMenu, listItemsByCategory,
  createCategory, deleteCategoryWithItems,
  createMenuItem, updateMenuItem, toggleItemAvailability, deleteMenuItem,
} from "@/lib/actions/admin.actions";
import type { MenuDoc, MenuCategoryDoc, MenuItemDoc } from "@/types/appwrite";
import {
  C, PageShell, PageHeader, SectionLabel, inputCls,
  AccentBtn, PrimaryBtn, Modal, PageLoader, VegDot, StatusPill,
} from "@/shared";

type ItemsMap = Record<string, MenuItemDoc[] | null>;
type NewItem  = Omit<MenuItemDoc, "$id"|"$collectionId"|"$databaseId"|"$createdAt"|"$updatedAt"|"$permissions"|"$sequence">;

const ACCENT: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#3dd6a3",
  lobby:      "#9b8fd4",
  event:      "#e07d9a",
};

function MenusContent() {
  const menuIdFromUrl = useSearchParams().get("menuId");

  const [menus,        setMenus]      = useState<MenuDoc[]>([]);
  const [activeMenuId, setActive]     = useState<string | null>(null);
  const [categories,   setCategories] = useState<Record<string, MenuCategoryDoc[] | null>>({});
  const [items,        setItems]      = useState<ItemsMap>({});
  const [loading,      setLoading]    = useState(true);
  const [loadingCats,  setLoadingCats]= useState<string | null>(null);
  const [loadingItems, setLoadingItm] = useState<string | null>(null);
  const [expandedCat,  setExpanded]   = useState<string | null>(null);
  const [editingItem,  setEditing]    = useState<MenuItemDoc | null>(null);
  const [showAddItem,  setShowItem]   = useState<string | null>(null);
  const [showAddCat,   setShowCat]    = useState(false);

  useEffect(() => {
    listMenus().then(ms => {
      setMenus(ms);
      const target = menuIdFromUrl ?? (ms[0]?.$id ?? null);
      if (target) setActive(target);
      setLoading(false);
    });
  }, []); // eslint-disable-line

  useEffect(() => {
    if (!activeMenuId || categories[activeMenuId] !== undefined) return;
    setLoadingCats(activeMenuId);
    listCategoriesByMenu(activeMenuId).then(cats => {
      setCategories(p => ({ ...p, [activeMenuId]: cats }));
      setLoadingCats(null);
    });
  }, [activeMenuId]); // eslint-disable-line

  const handleExpandCat = async (catId: string) => {
    if (expandedCat === catId) { setExpanded(null); return; }
    setExpanded(catId);
    if (items[catId] !== undefined) return;
    setLoadingItm(catId);
    const its = await listItemsByCategory(catId);
    setItems(p => ({ ...p, [catId]: its }));
    setLoadingItm(null);
  };

  const activeMenu = menus.find(m => m.$id === activeMenuId);
  const activeCats = activeMenuId ? (categories[activeMenuId] ?? []) : [];
  const accent     = ACCENT[activeMenu?.theme ?? ""] ?? "#c9a84c";
  const totalItems = activeCats.reduce((s, c) => s + (items[c.$id]?.length ?? 0), 0);
  const available  = activeCats.reduce((s, c) => s + (items[c.$id]?.filter(i => i.is_available).length ?? 0), 0);

  const handleToggleItem = async (catId: string, itemId: string, current: boolean) => {
    await toggleItemAvailability(itemId, !current);
    setItems(p => ({ ...p, [catId]: p[catId]?.map(i => i.$id === itemId ? { ...i, is_available: !current } : i) ?? null }));
  };

  const handleDeleteItem = async (catId: string, itemId: string) => {
    if (!confirm("Delete this item?")) return;
    await deleteMenuItem(itemId);
    setItems(p => ({ ...p, [catId]: p[catId]?.filter(i => i.$id !== itemId) ?? null }));
  };

  const handleDeleteCat = async (catId: string) => {
    if (!confirm("Delete this category and all its items?")) return;
    await deleteCategoryWithItems(catId);
    setCategories(p => ({ ...p, [activeMenuId!]: p[activeMenuId!]?.filter(c => c.$id !== catId) ?? null }));
    setItems(p => { const n = { ...p }; delete n[catId]; return n; });
  };

  const handleAddItem = async (catId: string, item: NewItem) => {
    const created = await createMenuItem({ category_id: catId, name: item.name, description: item.description, price: item.price, is_veg: item.is_veg, is_available: true, sort_order: items[catId]?.length ?? 0 });
    setItems(p => ({ ...p, [catId]: [...(p[catId] ?? []), created] }));
    setShowItem(null);
  };

  const handleAddCat = async (name: string) => {
    const created = await createCategory({ menu_id: activeMenuId!, name, sort_order: activeCats.length });
    setCategories(p => ({ ...p, [activeMenuId!]: [...(p[activeMenuId!] ?? []), created] }));
    setItems(p => ({ ...p, [created.$id]: [] }));
    setShowCat(false);
  };

  const handleSaveItem = async (itemId: string, data: Partial<Pick<MenuItemDoc, "name"|"description"|"price">>) => {
    const updated = await updateMenuItem(itemId, data);
    setItems(p => {
      const n = { ...p };
      for (const catId in n) {
        if (n[catId]?.some(i => i.$id === itemId))
          n[catId] = n[catId]!.map(i => i.$id === itemId ? { ...i, ...updated } : i);
      }
      return n;
    });
    setEditing(null);
  };

  if (loading) return <PageLoader />;

  if (!menus.length) return (
    <PageShell>
      <p className="text-[13px]" style={{ color: C.muted }}>No menus found. Create a venue first.</p>
    </PageShell>
  );

  return (
    <PageShell>
      <PageHeader eyebrow="Configuration" title="Menu Editor" sub="Edit categories and items for each venue menu" />

      {/* ── Menu tabs ── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {menus.map(m => {
          const ac = ACCENT[m.theme] ?? "#c9a84c";
          const active = m.$id === activeMenuId;
          return (
            <button
              key={m.$id}
              onClick={() => { setActive(m.$id); setExpanded(null); setShowCat(false); setShowItem(null); }}
              className="text-[12px] px-5 py-2 rounded-2xl transition-all cursor-pointer"
              style={{
                background: active ? `${ac}12` : C.card,
                border:     active ? `1px solid ${ac}30` : `1px solid ${C.border}`,
                color:      active ? ac : C.muted,
                fontWeight: active ? 500 : 400,
              }}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Categories", value: activeCats.length },
          { label: "Total Items", value: totalItems },
          { label: "Available",  value: totalItems > 0 ? `${available}/${totalItems}` : "—" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl px-5 py-4" style={{ background: C.card, border: `1px solid ${C.border}` }}>
            <p className="text-[10px] uppercase tracking-[0.18em] mb-1.5" style={{ color: C.muted }}>{s.label}</p>
            <p className="text-[28px] font-light leading-none" style={{ color: C.text, fontFamily: "var(--font-cormorant)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      {loadingCats === activeMenuId && (
        <div className="flex items-center gap-2 py-4" style={{ color: C.muted }}>
          <Loader2 size={13} className="animate-spin" />
          <span className="text-[12px]">Loading categories…</span>
        </div>
      )}

      {/* ── Categories ── */}
      <div className="flex flex-col gap-2 mb-3">
        {activeCats.map(cat => {
          const catItems  = items[cat.$id] ?? [];
          const isExp     = expandedCat === cat.$id;
          const isLoading = loadingItems === cat.$id;

          return (
            <div
              key={cat.$id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: C.card,
                border:     `1px solid ${isExp ? `${accent}28` : C.border}`,
                boxShadow:  "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* Category header */}
              <div
                className="flex items-center gap-3.5 px-5 py-3.5 cursor-pointer select-none transition-colors hover:bg-[#F9F8F6]"
                onClick={() => handleExpandCat(cat.$id)}
              >
                <span style={{ color: C.muted }}>
                  {isLoading ? <Loader2 size={13} className="animate-spin" /> : isExp ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>
                <span className="flex-1 text-[14px] font-light" style={{ color: C.text, fontFamily: "var(--font-cormorant)", letterSpacing: "0.03em" }}>
                  {cat.name}
                </span>
                <span
                  className="text-[10px] px-2.5 py-0.5 rounded-full mr-2"
                  style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
                >
                  {items[cat.$id] !== undefined ? `${catItems.length} items` : "expand to load"}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteCat(cat.$id); }}
                  className="cursor-pointer p-1.5 rounded-lg transition-colors"
                  style={{ color: C.muted }}
                  onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                  onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                >
                  <Trash2 size={12} />
                </button>
              </div>

              {/* Items */}
              {isExp && items[cat.$id] !== undefined && (
                <div className="px-5 py-4" style={{ borderTop: `1px solid ${accent}15` }}>
                  <div className="flex flex-col gap-1.5">
                    {catItems.map(item => (
                      <div
                        key={item.$id}
                        className="flex items-center gap-3.5 rounded-xl px-4 py-3 transition-all"
                        style={{
                          background: item.is_available ? C.bg : "#fef2f2",
                          border:     `1px solid ${item.is_available ? C.border : C.redBd}`,
                        }}
                      >
                        <VegDot isVeg={item.is_veg} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-medium" style={{ color: C.text }}>{item.name}</span>
                            {!item.is_available && <StatusPill label="Off menu" color="red" />}
                          </div>
                          {item.description && <p className="text-[10px] truncate mt-0.5" style={{ color: C.muted }}>{item.description}</p>}
                        </div>
                        <span className="text-[13px] font-semibold flex-shrink-0 tabular-nums" style={{ color: accent }}>₹{item.price}</span>
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => handleToggleItem(cat.$id, item.$id, item.is_available)} className="cursor-pointer p-1.5 rounded-lg transition-colors" style={{ color: item.is_available ? C.green : C.muted }}>
                            {item.is_available ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                          </button>
                          <button onClick={() => setEditing(item)} className="cursor-pointer p-1.5 rounded-lg transition-colors" style={{ color: C.muted }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.text)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                            <Pencil size={12} />
                          </button>
                          <button onClick={() => handleDeleteItem(cat.$id, item.$id)} className="cursor-pointer p-1.5 rounded-lg transition-colors" style={{ color: C.muted }}
                            onMouseEnter={e => (e.currentTarget.style.color = C.red)} onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                    {catItems.length === 0 && <p className="text-[11px] italic py-1" style={{ color: C.sub }}>No items yet</p>}
                  </div>

                  {showAddItem === cat.$id
                    ? <AddItemForm accent={accent} onClose={() => setShowItem(null)} onAdd={item => handleAddItem(cat.$id, { ...item, category_id: cat.$id })} sortOrder={catItems.length} />
                    : (
                      <button
                        onClick={() => setShowItem(cat.$id)}
                        className="flex items-center gap-1.5 text-[11px] mt-3 px-3 py-2 rounded-xl cursor-pointer transition-all hover:bg-[#F4F2EE]"
                        style={{ color: `${accent}99` }}
                      >
                        <Plus size={11} /> Add Item
                      </button>
                    )
                  }
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── Add category ── */}
      {showAddCat
        ? <AddCategoryForm accent={accent} onClose={() => setShowCat(false)} onAdd={handleAddCat} />
        : (
          <button
            onClick={() => setShowCat(true)}
            className="flex items-center gap-2 mt-1 text-[12px] rounded-2xl px-4 py-3.5 w-full justify-center cursor-pointer transition-all hover:bg-[#F4F2EE]"
            style={{ border: `2px dashed ${C.border}`, color: C.muted }}
          >
            <Plus size={13} /> Add Category
          </button>
        )
      }

      {editingItem && (
        <EditItemModal item={editingItem} accent={accent} onClose={() => setEditing(null)} onSave={handleSaveItem} />
      )}
    </PageShell>
  );
}

/* ─── Add Item Form ──────────────────────────────────── */
function AddItemForm({ accent, onClose, onAdd, sortOrder }: {
  accent: string; sortOrder: number; onClose: () => void;
  onAdd: (item: NewItem) => Promise<void>;
}) {
  const [name,  setName]  = useState("");
  const [desc,  setDesc]  = useState("");
  const [price, setPrice] = useState("");
  const [isVeg, setIsVeg] = useState(true);
  const [saving, setSaving] = useState(false);

  return (
    <div className="mt-3 rounded-2xl px-5 py-4 flex flex-col gap-3" style={{ background: C.bg, border: `1px solid ${accent}20` }}>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>Item name</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Paneer Tikka" className={inputCls} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>Price (₹)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="320" className={inputCls} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>Description</label>
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Ingredients / notes" className={inputCls} />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {([true, false] as const).map(v => (
            <button key={String(v)} onClick={() => setIsVeg(v)}
              className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl cursor-pointer transition-all"
              style={{
                border:     `1px solid ${isVeg === v ? (v ? "#16a34a35" : "#dc262635") : C.border}`,
                background: isVeg === v ? (v ? "#f0faf4" : "#fef2f2") : C.card,
                color:      isVeg === v ? (v ? C.green : C.red) : C.muted,
              }}
            >
              <div className="w-[5px] h-[5px] rounded-full" style={{ background: v ? "#16a34a" : "#dc2626" }} />
              {v ? "Veg" : "Non-veg"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <AccentBtn small accent={accent}
            onClick={async () => { if (!name || !price) return; setSaving(true); await onAdd({ category_id: "", name, description: desc, price: parseFloat(price), is_veg: isVeg, is_available: true, sort_order: sortOrder }); setSaving(false); }}
            disabled={saving || !name || !price}
          >
            {saving && <Loader2 size={10} className="animate-spin" />} Add
          </AccentBtn>
          <button onClick={onClose} className="text-[11px] px-2 cursor-pointer" style={{ color: C.muted }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Add Category Form ──────────────────────────────── */
function AddCategoryForm({ accent, onClose, onAdd }: { accent: string; onClose: () => void; onAdd: (name: string) => Promise<void> }) {
  const [name, setName]     = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <div className="mt-2 flex items-center gap-3 rounded-2xl px-5 py-3.5" style={{ background: C.bg, border: `1px solid ${accent}20` }}>
      <input
        value={name} onChange={e => setName(e.target.value)}
        placeholder="Category name, e.g. Desserts" autoFocus
        onKeyDown={e => { if (e.key === "Enter" && name && !saving) { setSaving(true); onAdd(name); } }}
        className={`flex-1 ${inputCls}`}
      />
      <AccentBtn small accent={accent}
        onClick={async () => { if (!name) return; setSaving(true); await onAdd(name); setSaving(false); }}
        disabled={saving || !name}
      >
        {saving ? <Loader2 size={10} className="animate-spin" /> : "Add"}
      </AccentBtn>
      <button onClick={onClose} className="text-[11px] cursor-pointer" style={{ color: C.muted }}>Cancel</button>
    </div>
  );
}

/* ─── Edit Item Modal ────────────────────────────────── */
function EditItemModal({ item, accent, onClose, onSave }: {
  item: MenuItemDoc; accent: string; onClose: () => void;
  onSave: (id: string, data: Partial<Pick<MenuItemDoc, "name"|"description"|"price">>) => Promise<void>;
}) {
  const [name,  setName]  = useState(item.name);
  const [desc,  setDesc]  = useState(item.description);
  const [price, setPrice] = useState(String(item.price));
  const [saving, setSaving] = useState(false);

  return (
    <Modal onClose={onClose} width="440px">
      <h2 className="text-[20px] font-light mb-0.5" style={{ color: C.text, fontFamily: "var(--font-cormorant)" }}>Edit Item</h2>
      <p className="text-[11px] mb-5" style={{ color: C.muted }}>{item.name}</p>
      <div className="flex flex-col gap-3.5">
        {[
          { label: "Name",        value: name,  set: setName },
          { label: "Description", value: desc,  set: setDesc },
        ].map(f => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>{f.label}</label>
            <input value={f.value} onChange={e => f.set(e.target.value)} className={inputCls} />
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Price (₹)</label>
          <input type="number" value={price} onChange={e => setPrice(e.target.value)} className={inputCls} />
        </div>
      </div>
      <div className="flex gap-3 mt-5">
        <AccentBtn accent={accent}
          onClick={async () => { setSaving(true); await onSave(item.$id, { name, description: desc, price: parseFloat(price) }); setSaving(false); }}
          disabled={saving}
        >
          {saving && <Loader2 size={12} className="animate-spin" />} Save Changes
        </AccentBtn>
        <button onClick={onClose} className="px-4 text-[13px] cursor-pointer" style={{ color: C.muted }}>Cancel</button>
      </div>
    </Modal>
  );
}

export default function MenusPage() {
  return <Suspense fallback={<PageLoader />}><MenusContent /></Suspense>;
}