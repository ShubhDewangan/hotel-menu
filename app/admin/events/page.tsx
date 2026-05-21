"use client";

import { useState } from "react";
import { Plus, Calendar, Clock, Pencil, Trash2, ToggleLeft, ToggleRight, ChevronRight } from "lucide-react";

type EventStatus = "upcoming" | "active" | "past";

type Event = {
  id: string;
  name: string;
  description: string;
  venue: string;
  venueSlug: string;
  startDate: string;
  endDate: string;
  status: EventStatus;
  useOwnMenu: boolean;
  menuLabel: string;
};

const mockEvents: Event[] = [
  {
    id: "e1",
    name: "Diwali Gala Dinner",
    description: "Special festive menu for the Diwali celebration",
    venue: "Restaurant",
    venueSlug: "restaurant",
    startDate: "2025-10-20",
    endDate: "2025-10-20",
    status: "upcoming",
    useOwnMenu: true,
    menuLabel: "Diwali Special Menu",
  },
  {
    id: "e2",
    name: "Sunday Brunch",
    description: "Weekly brunch event with extended all-day dining",
    venue: "Lobby Café",
    venueSlug: "lobby",
    startDate: "2025-09-28",
    endDate: "2025-09-28",
    status: "active",
    useOwnMenu: false,
    menuLabel: "Lobby Café Menu",
  },
  {
    id: "e3",
    name: "Pool Party",
    description: "Summer pool party with cocktails and snacks",
    venue: "Pool Side",
    venueSlug: "pool",
    startDate: "2025-09-10",
    endDate: "2025-09-10",
    status: "past",
    useOwnMenu: true,
    menuLabel: "Pool Party Menu",
  },
];

const statusStyle: Record<EventStatus, { bg: string; text: string; border: string; label: string }> = {
  upcoming: { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   label: "Upcoming" },
  active:   { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30",  label: "Active"   },
  past:     { bg: "bg-white/[0.04]",  text: "text-white/30",   border: "border-white/[0.08]",  label: "Past"     },
};

export default function EventsPage() {
  const [events, setEvents]       = useState(mockEvents);
  const [showCreate, setCreate]   = useState(false);
  const [filter, setFilter]       = useState<EventStatus | "all">("all");

  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);

  const toggleMenu = (id: string) =>
    setEvents((p) => p.map((e) => e.id === id ? { ...e, useOwnMenu: !e.useOwnMenu } : e));

  const deleteEvent = (id: string) =>
    setEvents((p) => p.filter((e) => e.id !== id));

  const counts = {
    all:      events.length,
    upcoming: events.filter((e) => e.status === "upcoming").length,
    active:   events.filter((e) => e.status === "active").length,
    past:     events.filter((e) => e.status === "past").length,
  };

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl text-white font-medium" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
            Events
          </h1>
          <p className="text-[13px] text-white/40 mt-1">
            Create events with custom menus — QR codes auto-route guests on the event date
          </p>
        </div>
        <button
          onClick={() => setCreate(true)}
          className="flex items-center gap-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[13px] px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} /> New Event
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(["all", "upcoming", "active", "past"] as const).map((s) => (
          <div key={s} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1 capitalize" style={{ fontFamily: "var(--font-cinzel)" }}>{s}</p>
            <p className="text-2xl text-white font-medium">{counts[s]}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5">
        {(["all", "active", "upcoming", "past"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-[12px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer capitalize"
            style={{
              borderColor: filter === f ? "#c9a84c50" : "rgba(255,255,255,0.06)",
              background:  filter === f ? "#c9a84c15" : "transparent",
              color:       filter === f ? "#c9a84c"   : "rgba(255,255,255,0.4)",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Event list */}
      <div className="flex flex-col gap-3">
        {filtered.map((event) => {
          const s = statusStyle[event.status];
          return (
            <div key={event.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-start gap-4 px-5 py-4">
                {/* Date badge */}
                <div className="flex-shrink-0 w-12 flex flex-col items-center bg-white/[0.04] border border-white/[0.06] rounded-lg py-2">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider" style={{ fontFamily: "var(--font-cinzel)" }}>
                    {new Date(event.startDate).toLocaleString("en", { month: "short" })}
                  </span>
                  <span className="text-[18px] text-white font-medium leading-tight">
                    {new Date(event.startDate).getDate()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[14px] text-white font-medium">{event.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      {s.label}
                    </span>
                    <span className="text-[10px] text-white/30 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                      /menu?venue=event_{event.id}
                    </span>
                  </div>
                  <p className="text-[12px] text-white/40 mt-0.5">{event.description}</p>

                  {/* Meta row */}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                      <Calendar size={11} /> {event.venue}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                      <Clock size={11} /> {event.startDate}
                    </span>
                    {/* Own menu toggle */}
                    <button
                      onClick={() => toggleMenu(event.id)}
                      className="flex items-center gap-1.5 text-[11px] cursor-pointer transition-colors"
                      style={{ color: event.useOwnMenu ? "#c9a84c" : "rgba(255,255,255,0.25)" }}
                    >
                      {event.useOwnMenu
                        ? <ToggleRight size={14} style={{ color: "#c9a84c" }} />
                        : <ToggleLeft size={14} />}
                      Custom menu: {event.useOwnMenu ? event.menuLabel : "using venue default"}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {event.useOwnMenu && (
                    <button className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/60 hover:text-[#c9a84c] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 px-2.5 py-1 rounded transition-colors cursor-pointer">
                      Edit Menu <ChevronRight size={11} />
                    </button>
                  )}
                  <button className="text-white/30 hover:text-white/60 cursor-pointer"><Pencil size={13} /></button>
                  <button onClick={() => deleteEvent(event.id)} className="text-white/30 hover:text-red-400 cursor-pointer"><Trash2 size={13} /></button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-white/20 text-[13px]">
            No {filter === "all" ? "" : filter} events
          </div>
        )}
      </div>

      {showCreate && <CreateEventModal onClose={() => setCreate(false)} />}
    </div>
  );
}

function CreateEventModal({ onClose }: { onClose: () => void }) {
  const [useOwnMenu, setUseOwnMenu] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl p-6 w-[480px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-[14px] text-white mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
          Create New Event
        </h2>
        <div className="flex flex-col gap-4">
          {[
            { label: "Event name",   placeholder: "e.g. Diwali Gala Dinner" },
            { label: "Description",  placeholder: "Brief description of the event" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">{f.label}</label>
              <input placeholder={f.placeholder}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">Start date</label>
              <input type="date"
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40 [color-scheme:dark]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">End date</label>
              <input type="date"
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40 [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Venue</label>
            <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40">
              <option value="restaurant">Restaurant</option>
              <option value="pool">Pool Side</option>
              <option value="lobby">Lobby Café</option>
            </select>
          </div>
          {/* Custom menu toggle */}
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3">
            <div>
              <p className="text-[13px] text-white/70">Custom event menu</p>
              <p className="text-[11px] text-white/30 mt-0.5">Override venue menu with a special event menu</p>
            </div>
            <button onClick={() => setUseOwnMenu(!useOwnMenu)} className="cursor-pointer">
              {useOwnMenu
                ? <ToggleRight size={20} className="text-[#c9a84c]" />
                : <ToggleLeft  size={20} className="text-white/30" />}
            </button>
          </div>
          {useOwnMenu && (
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">Menu label</label>
              <input placeholder="e.g. Diwali Special Menu"
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
            </div>
          )}
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[13px] py-2 rounded-lg transition-colors cursor-pointer">
            Create Event
          </button>
          <button onClick={onClose} className="px-4 text-white/30 hover:text-white/60 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}