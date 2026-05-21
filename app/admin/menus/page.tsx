"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical, ChevronDown, ChevronRight, ToggleLeft, ToggleRight } from "lucide-react";

// ── Types ─────────────────────────────────────────────────────
type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  isVeg: boolean;
  isAvailable: boolean;
};

type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

type Menu = {
  id: string;
  theme: string;
  label: string;
  categories: MenuCategory[];
};

// ── Mock data ─────────────────────────────────────────────────
const mockMenus: Menu[] = [
  {
    id: "m1", theme: "restaurant", label: "Restaurant Menu",
    categories: [
      {
        id: "c1", name: "Starters",
        items: [
          { id: "i1", name: "Pani Puri",        description: "Semolina shells, tamarind water, potato", price: 150, isVeg: true,  isAvailable: true },
          { id: "i2", name: "Chicken Tikka",    description: "Tandoor-charred, spiced marinade, mint",  price: 320, isVeg: false, isAvailable: true },
          { id: "i3", name: "Hara Bhara Kebab", description: "Spinach, peas, paneer, spiced crumb",     price: 260, isVeg: true,  isAvailable: false },
        ],
      },
      {
        id: "c2", name: "Mains",
        items: [
          { id: "i4", name: "Dal Makhani",    description: "Slow-cooked black lentils, cream, butter",  price: 380, isVeg: true,  isAvailable: true },
          { id: "i5", name: "Butter Chicken", description: "Tandoori chicken, tomato, fenugreek sauce", price: 450, isVeg: false, isAvailable: true },
        ],
      },
    ],
  },
  {
    id: "m2", theme: "pool", label: "Pool Menu",
    categories: [
      {
        id: "c3", name: "Starters",
        items: [
          { id: "i6", name: "Nachos Grande",  description: "Tortilla, jalapeños, guacamole, sour cream", price: 320, isVeg: true,  isAvailable: true },
          { id: "i7", name: "Chicken Wings",  description: "Buffalo sauce, blue cheese dip, celery",     price: 420, isVeg: false, isAvailable: true },
        ],
      },
    ],
  },
  {
    id: "m3", theme: "lobby", label: "Lobby Café Menu",
    categories: [
      {
        id: "c4", name: "Patisserie",
        items: [
          { id: "i8", name: "Croissant",  description: "Butter laminated, served warm, preserve", price: 180, isVeg: true, isAvailable: true },
          { id: "i9", name: "Opera Cake", description: "Coffee buttercream, chocolate ganache",    price: 280, isVeg: true, isAvailable: true },
        ],
      },
    ],
  },
];

const themeAccent: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#d4af6a",
  lobby:      "#d4af6a",
  event:      "#b07fd4",
};

// ── Page ──────────────────────────────────────────────────────
export default function MenusPage() {
  const [menus, setMenus]             = useState(mockMenus);
  const [activeMenuId, setActiveMenu] = useState("m1");
  const [expandedCat, setExpandedCat] = useState<string | null>("c1");
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editingCatId, setEditingCat] = useState<string | null>(null);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [showAddCat, setShowAddCat]   = useState(false);

  const activeMenu = menus.find((m) => m.id === activeMenuId) ?? menus[0];
  const accent     = themeAccent[activeMenu.theme] ?? "#c9a84c";

  const toggleItemAvailable = (catId: string, itemId: string) => {
    setMenus((p) =>
      p.map((m) =>
        m.id === activeMenuId
          ? {
              ...m,
              categories: m.categories.map((c) =>
                c.id === catId
                  ? { ...c, items: c.items.map((i) => i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i) }
                  : c
              ),
            }
          : m
      )
    );
  };

  const deleteItem = (catId: string, itemId: string) => {
    setMenus((p) =>
      p.map((m) =>
        m.id === activeMenuId
          ? { ...m, categories: m.categories.map((c) => c.id === catId ? { ...c, items: c.items.filter((i) => i.id !== itemId) } : c) }
          : m
      )
    );
  };

  const deleteCategory = (catId: string) => {
    setMenus((p) =>
      p.map((m) =>
        m.id === activeMenuId
          ? { ...m, categories: m.categories.filter((c) => c.id !== catId) }
          : m
      )
    );
  };

  const addItem = (catId: string, item: Omit<MenuItem, "id">) => {
    setMenus((p) =>
      p.map((m) =>
        m.id === activeMenuId
          ? {
              ...m,
              categories: m.categories.map((c) =>
                c.id === catId
                  ? { ...c, items: [...c.items, { ...item, id: `i${Date.now()}` }] }
                  : c
              ),
            }
          : m
      )
    );
    setShowAddItem(null);
  };

  const addCategory = (name: string) => {
    setMenus((p) =>
      p.map((m) =>
        m.id === activeMenuId
          ? { ...m, categories: [...m.categories, { id: `c${Date.now()}`, name, items: [] }] }
          : m
      )
    );
    setShowAddCat(false);
  };

  const totalItems = activeMenu.categories.reduce((s, c) => s + c.items.length, 0);
  const available  = activeMenu.categories.reduce((s, c) => s + c.items.filter((i) => i.isAvailable).length, 0);

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
          const ac = themeAccent[m.theme] ?? "#c9a84c";
          const active = m.id === activeMenuId;
          return (
            <button
              key={m.id}
              onClick={() => { setActiveMenu(m.id); setExpandedCat(null); }}
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
          <div key={cat.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Category header */}
            <div className="flex items-center gap-3 px-5 py-4">
              <button onClick={() => setExpandedCat((p) => p === cat.id ? null : cat.id)} className="text-white/40 hover:text-white/70 cursor-pointer">
                {expandedCat === cat.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <GripVertical size={14} className="text-white/20 cursor-grab" />
              <span className="flex-1 text-[14px] text-white font-medium">{cat.name}</span>
              <span className="text-[11px] text-white/30">{cat.items.length} items</span>
              <button className="text-white/30 hover:text-white/60 cursor-pointer ml-2"><Pencil size={13} /></button>
              <button onClick={() => deleteCategory(cat.id)} className="text-white/30 hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
            </div>

            {/* Items */}
            {expandedCat === cat.id && (
              <div className="border-t border-white/[0.06] px-5 py-3">
                <div className="flex flex-col gap-2">
                  {cat.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
                      <GripVertical size={13} className="text-white/15 cursor-grab flex-shrink-0" />
                      {/* Veg indicator */}
                      <div className={`w-[10px] h-[10px] rounded-[2px] border flex-shrink-0 flex items-center justify-center ${item.isVeg ? "border-green-600" : "border-red-600"}`}>
                        <div className={`w-[4px] h-[4px] rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[13px] text-white/80">{item.name}</span>
                          {!item.isAvailable && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded border border-red-500/20 text-red-400/70">Unavailable</span>
                          )}
                        </div>
                        <p className="text-[11px] text-white/30 truncate">{item.description}</p>
                      </div>
                      <span className="text-[12px] flex-shrink-0" style={{ color: accent }}>₹{item.price}</span>
                      <div className="flex items-center gap-2 ml-2">
                        <button onClick={() => toggleItemAvailable(cat.id, item.id)} className="text-white/20 hover:text-white/50 cursor-pointer">
                          {item.isAvailable ? <ToggleRight size={15} className="text-green-400/60" /> : <ToggleLeft size={15} />}
                        </button>
                        <button onClick={() => setEditingItem(item)} className="text-white/20 hover:text-white/50 cursor-pointer"><Pencil size={13} /></button>
                        <button onClick={() => deleteItem(cat.id, item.id)} className="text-white/20 hover:text-red-400/70 cursor-pointer"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                  {cat.items.length === 0 && (
                    <p className="text-[12px] text-white/20 italic py-1">No items yet</p>
                  )}
                </div>
                {/* Add item */}
                {showAddItem === cat.id ? (
                  <AddItemForm
                    onClose={() => setShowAddItem(null)}
                    onAdd={(item) => addItem(cat.id, item)}
                  />
                ) : (
                  <button
                    onClick={() => setShowAddItem(cat.id)}
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

      {/* Add category */}
      {showAddCat ? (
        <AddCategoryForm onClose={() => setShowAddCat(false)} onAdd={addCategory} />
      ) : (
        <button
          onClick={() => setShowAddCat(true)}
          className="flex items-center gap-2 mt-4 text-[13px] bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.06] text-white/40 hover:text-white/70 px-4 py-3 rounded-xl w-full justify-center transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add Category
        </button>
      )}

      {/* Edit item modal */}
      {editingItem && (
        <EditItemModal item={editingItem} accent={accent} onClose={() => setEditingItem(null)} />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function AddItemForm({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (item: Omit<MenuItem, "id">) => void;
}) {
  const [name, setName]         = useState("");
  const [desc, setDesc]         = useState("");
  const [price, setPrice]       = useState("");
  const [isVeg, setIsVeg]       = useState(true);

  const handleAdd = () => {
    if (!name || !price) return;
    onAdd({ name, description: desc, price: parseFloat(price), isVeg, isAvailable: true });
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
        <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Marinated cottage cheese, tandoor charred"
          className="bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-[11px] text-white/40">Type</label>
          <div className="flex gap-2">
            {[true, false].map((v) => (
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
          <button onClick={handleAdd}
            className="bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[12px] px-3 py-1.5 rounded-md transition-colors cursor-pointer">
            Add Item
          </button>
          <button onClick={onClose} className="text-white/30 hover:text-white/60 text-[12px] px-3 py-1.5 cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function AddCategoryForm({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => void }) {
  const [name, setName] = useState("");
  return (
    <div className="mt-2 flex items-center gap-3 bg-white/[0.02] border border-[#c9a84c]/15 rounded-xl px-4 py-3">
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name, e.g. Desserts"
        className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
      <button onClick={() => name && onAdd(name)}
        className="bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[12px] px-3 py-1.5 rounded-md transition-colors cursor-pointer">
        Add
      </button>
      <button onClick={onClose} className="text-white/30 hover:text-white/60 text-[12px] cursor-pointer">Cancel</button>
    </div>
  );
}

function EditItemModal({ item, accent, onClose }: { item: MenuItem; accent: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl p-6 w-[440px]">
        <h2 className="text-[14px] text-white mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
          Edit Item
        </h2>
        <div className="flex flex-col gap-4">
          {[
            { label: "Item name",    defaultValue: item.name,        placeholder: "" },
            { label: "Description",  defaultValue: item.description, placeholder: "" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">{f.label}</label>
              <input defaultValue={f.defaultValue} placeholder={f.placeholder}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Price (₹)</label>
            <input type="number" defaultValue={item.price}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40" />
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 border text-[13px] py-2 rounded-lg transition-colors cursor-pointer"
            style={{ background: `${accent}15`, borderColor: `${accent}40`, color: accent }}>
            Save Changes
          </button>
          <button onClick={onClose} className="px-4 text-white/30 hover:text-white/60 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}