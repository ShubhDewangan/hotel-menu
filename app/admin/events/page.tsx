"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Plus, Calendar, Clock, Trash2, ToggleLeft, ToggleRight,
  Loader2, ChevronDown, ChevronRight, X,
} from "lucide-react";
import {
  listEvents, listVenues, createEvent, toggleEventActive, deleteEvent,
  listCategoriesByMenu, listItemsByCategory, createCategory, deleteCategoryWithItems,
  createMenuItem, toggleItemAvailability, deleteMenuItem,
} from "@/lib/actions/admin.actions";
import type { EventDoc, VenueDoc, MenuCategoryDoc, MenuItemDoc } from "@/types/appwrite";

type EventStatus = "upcoming" | "active" | "past";

function getStatus(event: EventDoc): EventStatus {
  const now = new Date(), start = new Date(event.starts_at), end = new Date(event.ends_at);
  if (now < start) return "upcoming";
  if (now > end)   return "past";
  return "active";
}

const STATUS_STYLE: Record<EventStatus, { dot: string; bg: string; text: string; border: string }> = {
  upcoming: { dot: "bg-blue-400",  bg: "rgba(96,165,250,0.08)",  text: "text-blue-400/70",  border: "rgba(96,165,250,0.15)"  },
  active:   { dot: "bg-green-400", bg: "rgba(74,222,128,0.08)",  text: "text-green-400/70", border: "rgba(74,222,128,0.15)"  },
  past:     { dot: "bg-white/15",  bg: "rgba(255,255,255,0.03)", text: "text-white/30",      border: "rgba(255,255,255,0.06)" },
};

const inputCls =
  "bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/15 outline-none transition-colors focus:border-[rgba(201,168,76,0.3)]";

type ItemsMap = Record<string, MenuItemDoc[] | null>;

/* ─── Inline Menu Editor Modal ───────────────────────── */
function MenuEditorModal({ menuId, menuLabel, onClose }: { menuId: string; menuLabel: string; onClose: () => void }) {
  const [categories, setCategories] = useState<MenuCategoryDoc[] | null>(null);
  const [items, setItems]           = useState<ItemsMap>({});
  const [expandedCat, setExpanded]  = useState<string | null>(null);
  const [showAddCat, setShowAddCat] = useState(false);
  const [showAddItem, setShowAddItem] = useState<string | null>(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    listCategoriesByMenu(menuId).then((cats) => { setCategories(cats); setLoading(false); });
  }, [menuId]);

  const handleExpandCat = async (catId: string) => {
    if (expandedCat === catId) { setExpanded(null); return; }
    setExpanded(catId);
    if (items[catId] !== undefined) return;
    const its = await listItemsByCategory(catId);
    setItems((p) => ({ ...p, [catId]: its }));
  };

  const handleAddCat = async (name: string) => {
    const cat = await createCategory({ menu_id: menuId, name, sort_order: categories?.length ?? 0 });
    setCategories((p) => [...(p ?? []), cat]);
    setItems((p) => ({ ...p, [cat.$id]: [] }));
    setShowAddCat(false);
  };

  const handleDeleteCat = async (catId: string) => {
    if (!confirm("Delete category and all its items?")) return;
    await deleteCategoryWithItems(catId);
    setCategories((p) => p?.filter((c) => c.$id !== catId) ?? null);
  };

  const handleAddItem = async (catId: string, data: { name: string; description: string; price: number; is_veg: boolean }) => {
    const item = await createMenuItem({ category_id: catId, ...data, is_available: true, sort_order: items[catId]?.length ?? 0 });
    setItems((p) => ({ ...p, [catId]: [...(p[catId] ?? []), item] }));
    setShowAddItem(null);
  };

  const handleToggleItem = async (catId: string, itemId: string, current: boolean) => {
    await toggleItemAvailability(itemId, !current);
    setItems((p) => ({ ...p, [catId]: p[catId]?.map((i) => i.$id === itemId ? { ...i, is_available: !current } : i) ?? null }));
  };

  const handleDeleteItem = async (catId: string, itemId: string) => {
    await deleteMenuItem(itemId);
    setItems((p) => ({ ...p, [catId]: p[catId]?.filter((i) => i.$id !== itemId) ?? null }));
  };

  return (
    <div className="fixed inset-0 border border-white bg-gradient-to-b from-[#0B0B0B] to-[#352525] backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="rounded-[1.75rem] w-full max-w-2xl max-h-[85vh] flex flex-col border border-white/[0.07]"
        style={{ background: "linear-gradient(160deg, #1a110d 0%, #0c0908 100%)", boxShadow: "0 0 0 1px rgba(0,0,0,0.5), 0 40px 100px rgba(0,0,0,0.8)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
          <div>
            <h2 className="text-[14px] text-white/75 tracking-[0.08em]" style={{ fontFamily: "var(--font-cinzel)" }}>
              Menu Editor
            </h2>
            <p className="text-[11px] text-white/25 mt-0.5">{menuLabel}</p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 cursor-pointer transition-colors p-2 rounded-xl hover:bg-white/[0.04]">
            <X size={15} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center gap-2 text-white/25 py-4">
              <Loader2 size={14} className="animate-spin" /><span className="text-[12px]">Loading…</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(categories ?? []).map((cat) => (
                <div key={cat.$id} className="rounded-xl overflow-hidden border border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
                  <div
                    className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.015] select-none"
                    onClick={() => handleExpandCat(cat.$id)}
                  >
                    <span className="text-white/20">
                      {expandedCat === cat.$id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    </span>
                    <span className="flex-1 text-[13px] text-white/70" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.03em" }}>
                      {cat.name}
                    </span>
                    <span className="text-[10px] text-white/20 mr-2">{items[cat.$id]?.length ?? "…"} items</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.$id); }} className="text-white/15 hover:text-red-400/60 cursor-pointer p-1 rounded transition-colors">
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {expandedCat === cat.$id && (
                    <div className="border-t border-white/[0.04] px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {(items[cat.$id] ?? []).map((item) => (
                          <div key={item.$id} className="flex items-center gap-3 rounded-xl px-3 py-2.5 border border-white/[0.04]" style={{ background: "rgba(255,255,255,0.015)" }}>
                            <div className={`w-[8px] h-[8px] rounded-[2px] border flex-shrink-0 ${item.is_veg ? "border-green-600" : "border-red-600"}`}>
                              <div className={`w-full h-full scale-50 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                            </div>
                            <span className="flex-1 text-[12px] text-white/60 truncate">{item.name}</span>
                            <span className="text-[11px] font-semibold text-[#c9a84c]/60 tabular-nums">₹{item.price}</span>
                            <button onClick={() => handleToggleItem(cat.$id, item.$id, item.is_available)} className="cursor-pointer p-1">
                              {item.is_available ? <ToggleRight size={14} className="text-green-400/50" /> : <ToggleLeft size={14} className="text-white/20" />}
                            </button>
                            <button onClick={() => handleDeleteItem(cat.$id, item.$id)} className="text-white/15 hover:text-red-400/60 cursor-pointer p-1 transition-colors">
                              <Trash2 size={11} />
                            </button>
                          </div>
                        ))}
                        {(items[cat.$id]?.length ?? 0) === 0 && items[cat.$id] !== undefined && (
                          <p className="text-[11px] text-white/20 italic">No items yet</p>
                        )}
                      </div>

                      {showAddItem === cat.$id ? (
                        <QuickAddItem onClose={() => setShowAddItem(null)} onAdd={(d) => handleAddItem(cat.$id, d)} />
                      ) : (
                        <button onClick={() => setShowAddItem(cat.$id)} className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 mt-2.5 cursor-pointer transition-colors">
                          <Plus size={11} /> Add item
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {showAddCat ? (
                <QuickAddCat onClose={() => setShowAddCat(false)} onAdd={handleAddCat} />
              ) : (
                <button
                  onClick={() => setShowAddCat(true)}
                  className="flex items-center gap-2 py-3 rounded-xl border border-dashed text-white/25 hover:text-white/50 hover:border-white/15 justify-center text-[12px] cursor-pointer transition-all mt-1"
                  style={{ borderColor: "rgba(255,255,255,0.07)" }}
                >
                  <Plus size={13} /> Add Category
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickAddCat({ onClose, onAdd }: { onClose: () => void; onAdd: (name: string) => Promise<void> }) {
  const [name, setName]     = useState("");
  const [saving, setSaving] = useState(false);
  return (
    <div className="flex items-center gap-2 mt-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name"
        autoFocus
        onKeyDown={(e) => e.key === "Enter" && name && !saving && (setSaving(true), onAdd(name))}
        className={`flex-1 ${inputCls}`}
      />
      <button
        onClick={async () => { if (!name) return; setSaving(true); await onAdd(name); setSaving(false); }}
        disabled={saving || !name}
        className="px-3 py-2.5 rounded-xl bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/70 text-[11px] cursor-pointer disabled:opacity-40"
      >
        {saving ? <Loader2 size={11} className="animate-spin" /> : "Add"}
      </button>
      <button onClick={onClose} className="text-white/25 text-[11px] cursor-pointer">Cancel</button>
    </div>
  );
}

function QuickAddItem({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (d: { name: string; description: string; price: number; is_veg: boolean }) => Promise<void>;
}) {
  const [name, setName]     = useState("");
  const [price, setPrice]   = useState("");
  const [desc, setDesc]     = useState("");
  const [isVeg, setIsVeg]   = useState(true);
  const [saving, setSaving] = useState(false);
  return (
    <div className="mt-3 rounded-xl p-3.5 flex flex-col gap-2 border border-white/[0.05]" style={{ background: "rgba(255,255,255,0.02)" }}>
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name" className={inputCls} />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price ₹" className={inputCls} />
      </div>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" className={inputCls} />
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {([true, false] as const).map((v) => (
            <button
              key={String(v)}
              onClick={() => setIsVeg(v)}
              className="flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer"
              style={{
                borderColor: isVeg === v ? (v ? "#16a34a35" : "#dc262635") : "rgba(255,255,255,0.06)",
                background:  isVeg === v ? (v ? "#16a34a0c" : "#dc26260c") : "transparent",
                color:       isVeg === v ? (v ? "#4ade80"   : "#f87171")   : "rgba(255,255,255,0.25)",
              }}
            >
              {v ? "Veg" : "Non-veg"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => { if (!name || !price) return; setSaving(true); await onAdd({ name, description: desc, price: parseFloat(price), is_veg: isVeg }); setSaving(false); }}
            disabled={saving || !name || !price}
            className="px-3 py-1.5 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/70 text-[11px] cursor-pointer disabled:opacity-40"
          >
            {saving ? <Loader2 size={11} className="animate-spin" /> : "Add"}
          </button>
          <button onClick={onClose} className="text-white/25 text-[11px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main events page ───────────────────────────────── */
export default function EventsPage() {
  const [events, setEvents]           = useState<EventDoc[]>([]);
  const [venues, setVenues]           = useState<VenueDoc[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setCreate]       = useState(false);
  const [filter, setFilter]           = useState<EventStatus | "all">("all");
  const [editingMenu, setEditingMenu] = useState<{ menuId: string; label: string } | null>(null);
  const [isPending, startTransition]  = useTransition();

  useEffect(() => {
    Promise.all([listEvents(), listVenues()]).then(([evs, vs]) => {
      setEvents(evs); setVenues(vs); setLoading(false);
    });
  }, []);

  const filtered = filter === "all" ? events : events.filter((e) => getStatus(e) === filter);

  const handleToggle = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleEventActive(id, !current);
      setEvents((p) => p.map((e) => e.$id === id ? { ...e, is_active: !current } : e));
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this event?")) return;
    startTransition(async () => {
      await deleteEvent(id);
      setEvents((p) => p.filter((e) => e.$id !== id));
    });
  };

  const counts = {
    all:      events.length,
    upcoming: events.filter((e) => getStatus(e) === "upcoming").length,
    active:   events.filter((e) => getStatus(e) === "active").length,
    past:     events.filter((e) => getStatus(e) === "past").length,
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3 text-white/20">
        <Loader2 size={17} className="animate-spin" />
        <span className="text-[12px]" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.1em" }}>LOADING</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 p-7 overflow-y-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <p className="text-[10px] text-[#c9a84c]/40 tracking-[0.25em] uppercase mb-1.5" style={{ fontFamily: "var(--font-cinzel)" }}>
            Schedule
          </p>
          <h1 className="text-[22px] text-white/85 font-medium tracking-wide" style={{ fontFamily: "var(--font-cinzel)" }}>
            Events
          </h1>
          <p className="text-[12px] text-white/25 mt-1">QR codes auto-route guests to event menus on the event date</p>
        </div>
        <button
          onClick={() => setCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] border cursor-pointer transition-all hover:brightness-110"
          style={{
            background: "linear-gradient(135deg, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.06) 100%)",
            border: "1px solid rgba(201,168,76,0.22)",
            color: "#c9a84c",
          }}
        >
          <Plus size={13} /> New Event
        </button>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        {(["all", "upcoming", "active", "past"] as const).map((s) => (
          <div
            key={s}
            className="rounded-2xl px-5 py-4 border border-white/[0.05]"
            style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)" }}
          >
            <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] mb-2 capitalize" style={{ fontFamily: "var(--font-cinzel)" }}>{s}</p>
            <p className="text-[26px] text-white/75 font-medium tabular-nums leading-none">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["all", "active", "upcoming", "past"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-[11px] px-4 py-2 rounded-xl border transition-all cursor-pointer capitalize"
            style={{
              borderColor: filter === f ? "rgba(201,168,76,0.25)" : "rgba(255,255,255,0.05)",
              background:  filter === f ? "rgba(201,168,76,0.1)"  : "rgba(255,255,255,0.02)",
              color:       filter === f ? "#c9a84c"                : "rgba(255,255,255,0.28)",
              fontFamily:  filter === f ? "var(--font-cinzel)"     : "inherit",
              letterSpacing: filter === f ? "0.05em" : "0",
              fontSize: filter === f ? "10px" : "11px",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* ── Event list ── */}
      <div className="flex flex-col gap-2.5">
        {filtered.map((event) => {
          const status = getStatus(event);
          const s      = STATUS_STYLE[status];
          const venue  = venues.find((v) => v.$id === event.venue_id);

          return (
            <div
              key={event.$id}
              className="rounded-2xl px-5 py-4 border border-white/[0.05] transition-all"
              style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)" }}
            >
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div
                  className="flex-shrink-0 w-12 flex flex-col items-center rounded-2xl py-2.5 border border-white/[0.05]"
                  style={{ background: "rgba(255,255,255,0.03)" }}
                >
                  <span className="text-[9px] text-white/25 uppercase tracking-wider" style={{ fontFamily: "var(--font-cinzel)" }}>
                    {new Date(event.starts_at).toLocaleString("en", { month: "short" })}
                  </span>
                  <span className="text-[20px] text-white/75 font-medium leading-tight tabular-nums mt-0.5">
                    {new Date(event.starts_at).getDate()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
                    <span
                      className="text-[14px] text-white/80 font-medium"
                      style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.03em" }}
                    >
                      {event.name}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full ${s.text}`}
                      style={{ background: s.bg, border: `1px solid ${s.border}` }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </span>
                    {!event.is_active && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full border border-white/[0.08] text-white/25">Disabled</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                      <Calendar size={9} /> {venue?.name ?? "—"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                      <Clock size={9} />
                      {new Date(event.starts_at).toLocaleDateString()} → {new Date(event.ends_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-mono text-white/15 bg-white/[0.03] px-2 py-0.5 rounded-lg border border-white/[0.04]">
                      /menu?venue=event_{event.$id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      const menuId = event.use_own_menu && event.menu_id
                        ? event.menu_id
                        : venues.find((v) => v.$id === event.venue_id)?.menu_id;
                      if (menuId) setEditingMenu({ menuId, label: event.use_own_menu ? `${event.name} Menu` : `${venue?.name ?? ""} Menu` });
                    }}
                    className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-xl border transition-all cursor-pointer"
                    style={{
                      background: "rgba(201,168,76,0.07)",
                      border: "1px solid rgba(201,168,76,0.18)",
                      color: "rgba(201,168,76,0.65)",
                    }}
                  >
                    Edit Menu
                  </button>
                  <button onClick={() => handleToggle(event.$id, event.is_active)} disabled={isPending} className="cursor-pointer p-1.5 rounded-xl hover:bg-white/[0.04] transition-colors">
                    {event.is_active ? <ToggleRight size={16} className="text-green-400/60" /> : <ToggleLeft size={16} className="text-white/20" />}
                  </button>
                  <button onClick={() => handleDelete(event.$id)} disabled={isPending} className="p-1.5 rounded-xl text-white/15 hover:text-red-400/60 hover:bg-red-500/[0.05] cursor-pointer transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-16 text-white/20 text-[12px]">
            No {filter === "all" ? "" : filter} events
          </div>
        )}
      </div>

      {showCreate && (
        <CreateEventModal
          venues={venues}
          onClose={() => setCreate(false)}
          onCreate={async (data) => {
            const { event } = await createEvent(data);
            setEvents((p) => [...p, event]);
            setCreate(false);
          }}
        />
      )}

      {editingMenu && (
        <MenuEditorModal
          menuId={editingMenu.menuId}
          menuLabel={editingMenu.label}
          onClose={() => setEditingMenu(null)}
        />
      )}
    </div>
  );
}

/* ─── Create Event Modal ─────────────────────────────── */
function CreateEventModal({ venues, onClose, onCreate }: {
  venues: VenueDoc[];
  onClose: () => void;
  onCreate: (data: { venue_id: string; name: string; starts_at: string; ends_at: string; use_own_menu: boolean }) => Promise<void>;
}) {
  const [name, setName]         = useState("");
  const [venueId, setVenueId]   = useState(venues[0]?.$id ?? "");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt]     = useState("");
  const [useOwn, setUseOwn]     = useState(false);
  const [saving, setSaving]     = useState(false);

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center">
      <div
        className="rounded-[1.75rem] p-7 w-[460px] border border-white/[0.07]"
        style={{
          background: "linear-gradient(160deg, #1e1410 0%, #0d0a08 100%)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.07), 0 32px 80px rgba(0,0,0,0.7)",
        }}
      >
        <h2 className="text-[15px] text-white/75 mb-1 tracking-[0.08em]" style={{ fontFamily: "var(--font-cinzel)" }}>
          New Event
        </h2>
        <p className="text-[11px] text-white/25 mb-6">Configure your event details and schedule</p>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-white/30 uppercase tracking-widest" style={{ fontFamily: "var(--font-cinzel)" }}>Event name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali Gala Dinner" className={inputCls} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] text-white/30 uppercase tracking-widest" style={{ fontFamily: "var(--font-cinzel)" }}>Venue</label>
            <select value={venueId} onChange={(e) => setVenueId(e.target.value)} className={inputCls} style={{ colorScheme: "dark" }}>
              {venues.map((v) => <option key={v.$id} value={v.$id}>{v.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Start", value: startsAt, onChange: setStartsAt },
              { label: "End",   value: endsAt,   onChange: setEndsAt   },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <label className="text-[9px] text-white/30 uppercase tracking-widest" style={{ fontFamily: "var(--font-cinzel)" }}>{f.label}</label>
                <input
                  type="datetime-local"
                  value={f.value}
                  onChange={(e) => f.onChange(e.target.value)}
                  className={inputCls}
                  style={{ colorScheme: "dark" }}
                />
              </div>
            ))}
          </div>

          {/* Custom menu toggle */}
          <div
            className="flex items-center justify-between rounded-xl px-4 py-3.5 border border-white/[0.05] cursor-pointer transition-all"
            style={{ background: "rgba(255,255,255,0.02)" }}
            onClick={() => setUseOwn(!useOwn)}
          >
            <div>
              <p className="text-[12px] text-white/60">Custom event menu</p>
              <p className="text-[10px] text-white/25 mt-0.5">Auto-creates a blank menu for this event</p>
            </div>
            {useOwn
              ? <ToggleRight size={18} className="text-[#c9a84c] flex-shrink-0" />
              : <ToggleLeft  size={18} className="text-white/25 flex-shrink-0" />}
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={async () => { if (!name || !venueId || !startsAt || !endsAt) return; setSaving(true); await onCreate({ venue_id: venueId, name, starts_at: new Date(startsAt).toISOString(), ends_at: new Date(endsAt).toISOString(), use_own_menu: useOwn }); setSaving(false); }}
            disabled={saving || !name || !venueId || !startsAt || !endsAt}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-[12px] cursor-pointer disabled:opacity-40 transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(201,168,76,0.14) 0%, rgba(201,168,76,0.07) 100%)",
              border: "1px solid rgba(201,168,76,0.25)",
              color: "#c9a84c",
            }}
          >
            {saving && <Loader2 size={12} className="animate-spin" />}
            <span style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.06em", fontSize: "11px" }}>CREATE EVENT</span>
          </button>
          <button onClick={onClose} className="px-4 text-white/25 hover:text-white/50 text-[13px] cursor-pointer transition-colors">Cancel</button>
        </div>
      </div>
    </div>
  );
}