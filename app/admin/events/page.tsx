"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Calendar, Clock, Trash2, ToggleLeft, ToggleRight, Loader2, ChevronDown, ChevronRight, X } from "lucide-react";
import {
  listEvents, listVenues, createEvent, toggleEventActive, deleteEvent,
  listCategoriesByMenu, listItemsByCategory, createCategory, deleteCategoryWithItems,
  createMenuItem, updateMenuItem, toggleItemAvailability, deleteMenuItem,
} from "@/lib/actions/admin.actions";
import type { EventDoc, VenueDoc, MenuCategoryDoc, MenuItemDoc } from "@/types/appwrite";

type EventStatus = "upcoming" | "active" | "past";

function getStatus(event: EventDoc): EventStatus {
  const now = new Date(), start = new Date(event.starts_at), end = new Date(event.ends_at);
  if (now < start) return "upcoming";
  if (now > end)   return "past";
  return "active";
}

const STATUS_STYLE: Record<EventStatus, { dot: string; label: string; text: string }> = {
  upcoming: { dot: "bg-blue-400",   label: "Upcoming", text: "text-blue-400/70"  },
  active:   { dot: "bg-green-400",  label: "Active",   text: "text-green-400/70" },
  past:     { dot: "bg-white/20",   label: "Past",     text: "text-white/30"     },
};

// ── Inline menu editor ────────────────────────────────────────
type ItemsMap = Record<string, MenuItemDoc[] | null>;
type CatMap   = Record<string, MenuCategoryDoc[] | null>;

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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0f15] border border-white/[0.07] rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
          <div>
            <h2 className="text-[14px] text-white/80" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
              Menu Editor
            </h2>
            <p className="text-[11px] text-white/30 mt-0.5">{menuLabel}</p>
          </div>
          <button onClick={onClose} className="text-white/25 hover:text-white/60 cursor-pointer transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center gap-2 text-white/25 py-4">
              <Loader2 size={14} className="animate-spin" /><span className="text-[12px]">Loading…</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {(categories ?? []).map((cat) => (
                <div key={cat.$id} className="bg-white/[0.02] border border-white/[0.05] rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-white/[0.02] select-none"
                    onClick={() => handleExpandCat(cat.$id)}>
                    <span className="text-white/25">{expandedCat === cat.$id ? <ChevronDown size={13} /> : <ChevronRight size={13} />}</span>
                    <span className="flex-1 text-[13px] text-white/75">{cat.name}</span>
                    <span className="text-[10px] text-white/25 mr-2">{items[cat.$id]?.length ?? "…"} items</span>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteCat(cat.$id); }} className="text-white/15 hover:text-red-400/60 cursor-pointer p-1">
                      <Trash2 size={11} />
                    </button>
                  </div>

                  {expandedCat === cat.$id && (
                    <div className="border-t border-white/[0.04] px-4 py-3">
                      <div className="flex flex-col gap-1.5">
                        {(items[cat.$id] ?? []).map((item) => (
                          <div key={item.$id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-3 py-2.5">
                            <div className={`w-[9px] h-[9px] rounded-[2px] border flex-shrink-0 ${item.is_veg ? "border-green-600" : "border-red-600"}`}>
                              <div className={`w-full h-full scale-50 rounded-full ${item.is_veg ? "bg-green-600" : "bg-red-600"}`} />
                            </div>
                            <span className="flex-1 text-[12px] text-white/65 truncate">{item.name}</span>
                            <span className="text-[11px] text-[#c9a84c]/60 tabular-nums">₹{item.price}</span>
                            <button onClick={() => handleToggleItem(cat.$id, item.$id, item.is_available)} className="cursor-pointer">
                              {item.is_available ? <ToggleRight size={14} className="text-green-400/50" /> : <ToggleLeft size={14} className="text-white/20" />}
                            </button>
                            <button onClick={() => handleDeleteItem(cat.$id, item.$id)} className="text-white/15 hover:text-red-400/60 cursor-pointer">
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
                        <button onClick={() => setShowAddItem(cat.$id)}
                          className="flex items-center gap-1 text-[11px] text-white/25 hover:text-white/50 mt-2 cursor-pointer transition-colors">
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
                <button onClick={() => setShowAddCat(true)}
                  className="flex items-center gap-2 py-3 rounded-xl border border-dashed border-white/[0.07] text-white/25 hover:text-white/50 hover:border-white/15 justify-center text-[12px] cursor-pointer transition-all">
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
      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name"
        autoFocus onKeyDown={(e) => e.key === "Enter" && name && !saving && (setSaving(true), onAdd(name))}
        className="flex-1 bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-[12px] text-white placeholder-white/20 outline-none focus:border-white/15" />
      <button onClick={async () => { if (!name) return; setSaving(true); await onAdd(name); setSaving(false); }}
        disabled={saving || !name} className="px-3 py-1.5 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/70 text-[11px] cursor-pointer disabled:opacity-40">
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
    <div className="mt-2 bg-white/[0.02] border border-white/[0.05] rounded-xl p-3 flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Item name"
          className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-[12px] text-white placeholder-white/20 outline-none focus:border-white/15" />
        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Price ₹"
          className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-[12px] text-white placeholder-white/20 outline-none focus:border-white/15" />
      </div>
      <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description"
        className="bg-white/[0.04] border border-white/[0.07] rounded-lg px-3 py-1.5 text-[12px] text-white placeholder-white/20 outline-none focus:border-white/15" />
      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {([true, false] as const).map((v) => (
            <button key={String(v)} onClick={() => setIsVeg(v)}
              className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg border transition-all cursor-pointer"
              style={{
                borderColor: isVeg === v ? (v ? "#16a34a40" : "#dc262640") : "rgba(255,255,255,0.06)",
                background:  isVeg === v ? (v ? "#16a34a10" : "#dc262610") : "transparent",
                color:       isVeg === v ? (v ? "#4ade80"   : "#f87171")   : "rgba(255,255,255,0.25)",
              }}>
              {v ? "Veg" : "Non-veg"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={async () => { if (!name || !price) return; setSaving(true); await onAdd({ name, description: desc, price: parseFloat(price), is_veg: isVeg }); setSaving(false); }}
            disabled={saving || !name || !price}
            className="px-3 py-1 rounded-lg bg-[#c9a84c]/10 border border-[#c9a84c]/20 text-[#c9a84c]/70 text-[11px] cursor-pointer disabled:opacity-40">
            {saving ? <Loader2 size={11} className="animate-spin" /> : "Add"}
          </button>
          <button onClick={onClose} className="text-white/25 text-[11px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Main events page ──────────────────────────────────────────
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
    all: events.length,
    upcoming: events.filter((e) => getStatus(e) === "upcoming").length,
    active:   events.filter((e) => getStatus(e) === "active").length,
    past:     events.filter((e) => getStatus(e) === "past").length,
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3 text-white/20">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px]">Loading…</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[18px] text-white/90 font-medium tracking-wide" style={{ fontFamily: "var(--font-cinzel)" }}>Events</h1>
          <p className="text-[12px] text-white/30 mt-0.5">QR codes auto-route guests to event menus on the event date</p>
        </div>
        <button onClick={() => setCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] border border-[#c9a84c]/25 bg-[#c9a84c]/08 text-[#c9a84c]/80 hover:bg-[#c9a84c]/15 hover:text-[#c9a84c] transition-all cursor-pointer">
          <Plus size={14} /> New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {(["all", "upcoming", "active", "past"] as const).map((s) => (
          <div key={s} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1 capitalize" style={{ fontFamily: "var(--font-cinzel)" }}>{s}</p>
            <p className="text-[22px] text-white/80 font-medium tabular-nums">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 mb-5">
        {(["all", "active", "upcoming", "past"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className="text-[11px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer capitalize"
            style={{
              borderColor: filter === f ? "#c9a84c30" : "rgba(255,255,255,0.05)",
              background:  filter === f ? "#c9a84c0f" : "transparent",
              color:       filter === f ? "#c9a84c"   : "rgba(255,255,255,0.3)",
            }}>
            {f}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="flex flex-col gap-2">
        {filtered.map((event) => {
          const status = getStatus(event);
          const s      = STATUS_STYLE[status];
          const venue  = venues.find((v) => v.$id === event.venue_id);

          return (
            <div key={event.$id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl px-5 py-4">
              <div className="flex items-start gap-4">
                {/* Date badge */}
                <div className="flex-shrink-0 w-11 flex flex-col items-center bg-white/[0.03] border border-white/[0.05] rounded-xl py-2">
                  <span className="text-[9px] text-white/25 uppercase tracking-wider">
                    {new Date(event.starts_at).toLocaleString("en", { month: "short" })}
                  </span>
                  <span className="text-[17px] text-white/75 font-medium leading-tight tabular-nums">
                    {new Date(event.starts_at).getDate()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="text-[14px] text-white/80 font-medium">{event.name}</span>
                    <span className={`flex items-center gap-1 text-[10px] ${s.text}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
                    </span>
                    {!event.is_active && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-white/[0.08] text-white/25">Disabled</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                      <Calendar size={10} /> {venue?.name ?? "—"}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-white/25">
                      <Clock size={10} />
                      {new Date(event.starts_at).toLocaleDateString()} → {new Date(event.ends_at).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-mono text-white/15 bg-white/[0.03] px-2 py-0.5 rounded">
                      /menu?venue=event_{event.$id}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Edit menu button */}
                  <button
                    onClick={() => {
                      const menuId = event.use_own_menu && event.menu_id
                        ? event.menu_id
                        : venues.find((v) => v.$id === event.venue_id)?.menu_id;
                      if (menuId) setEditingMenu({ menuId, label: event.use_own_menu ? `${event.name} Menu` : `${venue?.name ?? ""} Menu` });
                    }}
                    className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border border-[#c9a84c]/20 bg-[#c9a84c]/06 text-[#c9a84c]/60 hover:bg-[#c9a84c]/12 hover:text-[#c9a84c]/80 transition-all cursor-pointer">
                    Edit Menu
                  </button>
                  <button onClick={() => handleToggle(event.$id, event.is_active)} disabled={isPending}
                    className="text-white/20 hover:text-white/50 cursor-pointer p-1">
                    {event.is_active ? <ToggleRight size={16} className="text-green-400/60" /> : <ToggleLeft size={16} />}
                  </button>
                  <button onClick={() => handleDelete(event.$id)} disabled={isPending}
                    className="text-white/15 hover:text-red-400/60 cursor-pointer p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/20 text-[12px]">
            No {filter === "all" ? "" : filter} events
          </div>
        )}
      </div>

      {showCreate && (
        <CreateEventModal venues={venues} onClose={() => setCreate(false)}
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0d0f15] border border-white/[0.07] rounded-2xl p-6 w-[440px]">
        <h2 className="text-[14px] text-white/80 mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>New Event</h2>
        <div className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/30">Event name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali Gala Dinner"
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/15 outline-none focus:border-white/15" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/30">Venue</label>
            <select value={venueId} onChange={(e) => setVenueId(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15">
              {venues.map((v) => <option key={v.$id} value={v.$id}>{v.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Start", value: startsAt, onChange: setStartsAt },
              { label: "End",   value: endsAt,   onChange: setEndsAt   },
            ].map((f) => (
              <div key={f.label} className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/30">{f.label}</label>
                <input type="datetime-local" value={f.value} onChange={(e) => f.onChange(e.target.value)}
                  className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[12px] text-white outline-none focus:border-white/15 [color-scheme:dark]" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
            <div>
              <p className="text-[12px] text-white/60">Custom event menu</p>
              <p className="text-[10px] text-white/25 mt-0.5">Auto-creates a blank menu for this event</p>
            </div>
            <button onClick={() => setUseOwn(!useOwn)} className="cursor-pointer">
              {useOwn ? <ToggleRight size={18} className="text-[#c9a84c]" /> : <ToggleLeft size={18} className="text-white/25" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            onClick={async () => { if (!name || !venueId || !startsAt || !endsAt) return; setSaving(true); await onCreate({ venue_id: venueId, name, starts_at: new Date(startsAt).toISOString(), ends_at: new Date(endsAt).toISOString(), use_own_menu: useOwn }); setSaving(false); }}
            disabled={saving || !name || !venueId || !startsAt || !endsAt}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#c9a84c]/25 bg-[#c9a84c]/08 text-[#c9a84c]/80 text-[13px] cursor-pointer disabled:opacity-40 hover:bg-[#c9a84c]/15 transition-all">
            {saving && <Loader2 size={13} className="animate-spin" />} Create Event
          </button>
          <button onClick={onClose} className="px-4 text-white/25 hover:text-white/50 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}