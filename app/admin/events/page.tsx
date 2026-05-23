"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, Calendar, Clock, Trash2, ToggleLeft, ToggleRight, ChevronRight, Loader2 } from "lucide-react";
import {
  listEvents,
  listVenues,
  createEvent,
  toggleEventActive,
  deleteEvent,
} from "@/lib/actions/admin.actions";
import type { EventDoc, VenueDoc } from "@/types/appwrite";

type EventStatus = "upcoming" | "active" | "past";

function getStatus(event: EventDoc): EventStatus {
  const now  = new Date();
  const start = new Date(event.starts_at);
  const end   = new Date(event.ends_at);
  if (now < start) return "upcoming";
  if (now > end)   return "past";
  return "active";
}

const statusStyle: Record<EventStatus, { bg: string; text: string; border: string; label: string }> = {
  upcoming: { bg: "bg-blue-500/10",   text: "text-blue-400",   border: "border-blue-500/30",   label: "Upcoming" },
  active:   { bg: "bg-green-500/10",  text: "text-green-400",  border: "border-green-500/30",  label: "Active"   },
  past:     { bg: "bg-white/[0.04]",  text: "text-white/30",   border: "border-white/[0.08]",  label: "Past"     },
};

export default function EventsPage() {
  const [events, setEvents]       = useState<EventDoc[]>([]);
  const [venues, setVenues]       = useState<VenueDoc[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showCreate, setCreate]   = useState(false);
  const [filter, setFilter]       = useState<EventStatus | "all">("all");
  const [isPending, startTransition] = useTransition();

  const load = async () => {
    setLoading(true);
    try {
      const [evs, vs] = await Promise.all([listEvents(), listVenues()]);
      setEvents(evs);
      setVenues(vs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

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
    <div className="p-8 flex items-center gap-3 text-white/30">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-[13px]">Loading events…</span>
    </div>
  );

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
          const status = getStatus(event);
          const s      = statusStyle[status];
          const venue  = venues.find((v) => v.$id === event.venue_id);

          return (
            <div key={event.$id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="flex items-start gap-4 px-5 py-4">
                {/* Date badge */}
                <div className="flex-shrink-0 w-12 flex flex-col items-center bg-white/[0.04] border border-white/[0.06] rounded-lg py-2">
                  <span className="text-[10px] text-white/30 uppercase tracking-wider" style={{ fontFamily: "var(--font-cinzel)" }}>
                    {new Date(event.starts_at).toLocaleString("en", { month: "short" })}
                  </span>
                  <span className="text-[18px] text-white font-medium leading-tight">
                    {new Date(event.starts_at).getDate()}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-[14px] text-white font-medium">{event.name}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${s.bg} ${s.text} ${s.border}`}>
                      {s.label}
                    </span>
                    {!event.is_active && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/[0.08] text-white/25">
                        Disabled
                      </span>
                    )}
                    <span className="text-[10px] text-white/30 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                      /menu?venue=event_{event.$id}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                      <Calendar size={11} /> {venue?.name ?? event.venue_id}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-white/30">
                      <Clock size={11} />
                      {new Date(event.starts_at).toLocaleDateString()} → {new Date(event.ends_at).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px]" style={{ color: event.use_own_menu ? "#c9a84c" : "rgba(255,255,255,0.25)" }}>
                      {event.use_own_menu
                        ? <ToggleRight size={14} style={{ color: "#c9a84c" }} />
                        : <ToggleLeft size={14} />}
                      {event.use_own_menu ? "Custom menu" : "Venue default menu"}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {event.use_own_menu && event.menu_id && (
                    <button className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/60 hover:text-[#c9a84c] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 px-2.5 py-1 rounded transition-colors cursor-pointer">
                      Edit Menu <ChevronRight size={11} />
                    </button>
                  )}
                  <button
                    onClick={() => handleToggle(event.$id, event.is_active)}
                    className="text-white/30 hover:text-white/60 cursor-pointer"
                    disabled={isPending}
                  >
                    {event.is_active ? <ToggleRight size={16} className="text-green-400" /> : <ToggleLeft size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(event.$id)}
                    className="text-white/30 hover:text-red-400 cursor-pointer"
                    disabled={isPending}
                  >
                    <Trash2 size={13} />
                  </button>
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
    </div>
  );
}

function CreateEventModal({ venues, onClose, onCreate }: {
  venues:   VenueDoc[];
  onClose:  () => void;
  onCreate: (data: {
    venue_id:     string;
    name:         string;
    starts_at:    string;
    ends_at:      string;
    use_own_menu: boolean;
  }) => Promise<void>;
}) {
  const [name, setName]           = useState("");
  const [venueId, setVenueId]     = useState(venues[0]?.$id ?? "");
  const [startsAt, setStartsAt]   = useState("");
  const [endsAt, setEndsAt]       = useState("");
  const [useOwnMenu, setOwn]      = useState(false);
  const [saving, setSaving]       = useState(false);

  const handle = async () => {
    if (!name || !venueId || !startsAt || !endsAt) return;
    setSaving(true);
    await onCreate({
      venue_id:     venueId,
      name,
      starts_at:    new Date(startsAt).toISOString(),
      ends_at:      new Date(endsAt).toISOString(),
      use_own_menu: useOwnMenu,
    });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl p-6 w-[480px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-[14px] text-white mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
          Create New Event
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Event name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Diwali Gala Dinner"
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Venue</label>
            <select value={venueId} onChange={(e) => setVenueId(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40">
              {venues.map((v) => (
                <option key={v.$id} value={v.$id}>{v.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">Start date</label>
              <input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40 [color-scheme:dark]" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">End date</label>
              <input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40 [color-scheme:dark]" />
            </div>
          </div>
          <div className="flex items-center justify-between bg-white/[0.02] border border-white/[0.06] rounded-lg px-4 py-3">
            <div>
              <p className="text-[13px] text-white/70">Custom event menu</p>
              <p className="text-[11px] text-white/30 mt-0.5">Auto-creates a blank menu for this event</p>
            </div>
            <button onClick={() => setOwn(!useOwnMenu)} className="cursor-pointer">
              {useOwnMenu
                ? <ToggleRight size={20} className="text-[#c9a84c]" />
                : <ToggleLeft  size={20} className="text-white/30" />}
            </button>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handle}
            disabled={saving || !name || !venueId || !startsAt || !endsAt}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[13px] py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 size={13} className="animate-spin" />} Create Event
          </button>
          <button onClick={onClose} className="px-4 text-white/30 hover:text-white/60 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}