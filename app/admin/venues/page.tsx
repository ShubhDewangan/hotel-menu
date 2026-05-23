/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Plus, ChevronDown, ChevronRight, QrCode,
  Pencil, Trash2, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react";
import {
  listVenues, createVenue, updateVenue,
  toggleVenueActive, deleteVenue,
  listTablesByVenue, createTable,
  toggleTableActive, deleteTableWithSeats,
  generateQRCodesForTable,
} from "@/lib/actions/admin.actions";
import type { VenueDoc, TableDoc } from "@/types/appwrite";

export default function VenuesPage() {
  const [venues, setVenues]           = useState<(VenueDoc & { tables: TableDoc[] })[]>([]);
  const [loading, setLoading]         = useState(true);
  const [expandedVenue, setExpanded]  = useState<string | null>(null);
  const [showAddVenue, setShowAdd]    = useState(false);
  const [showAddTable, setShowTable]  = useState<string | null>(null);
  const [isPending, startTransition]  = useTransition();

  const load = async () => {
    setLoading(true);
    try {
      const vs = await listVenues();
      const withTables = await Promise.all(
        vs.map(async (v) => ({
          ...v,
          tables: await listTablesByVenue(v.$id),
        }))
      );
      setVenues(withTables);
      if (withTables.length > 0 && !expandedVenue) {
        setExpanded(withTables[0].$id);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleToggleVenue = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleVenueActive(id, !current);
      setVenues((p) => p.map((v) => v.$id === id ? { ...v, is_active: !current } : v));
    });
  };

  const handleDeleteVenue = (id: string) => {
    if (!confirm("Delete this venue and all its tables/seats/QR codes?")) return;
    startTransition(async () => {
      await deleteVenue(id);
      setVenues((p) => p.filter((v) => v.$id !== id));
    });
  };

  const handleToggleTable = (venueId: string, tableId: string, current: boolean) => {
    startTransition(async () => {
      await toggleTableActive(tableId, !current);
      setVenues((p) =>
        p.map((v) =>
          v.$id === venueId
            ? { ...v, tables: v.tables.map((t: any) => t.$id === tableId ? { ...t, is_active: !current } : t) }
            : v
        )
      );
    });
  };

  const handleDeleteTable = (venueId: string, tableId: string) => {
    if (!confirm("Delete this table and all its seats/QR codes?")) return;
    startTransition(async () => {
      await deleteTableWithSeats(tableId);
      setVenues((p) =>
        p.map((v) =>
          v.$id === venueId ? { ...v, tables: v.tables.filter((t: any) => t.$id !== tableId) } : v
        )
      );
    });
  };

  const handleGenerateQRs = (venueId: string, tableId: string, venueSlug: string, tableNumber: number) => {
    startTransition(async () => {
      await generateQRCodesForTable({ tableId, venueSlug, tableNumber });
      alert("QR codes generated! Visit the QR Codes page to download them.");
    });
  };

  const totalSeats = (tables: TableDoc[]) => tables.reduce((s, t) => s + t.seat_count, 0);

  if (loading) return <LoadingState />;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl text-white font-medium" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
            Venues &amp; Tables
          </h1>
          <p className="text-[13px] text-white/40 mt-1">
            Manage hotel venues, tables, seats and QR generation
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[13px] px-4 py-2 rounded-lg transition-colors cursor-pointer"
        >
          <Plus size={14} /> Add Venue
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Venues", value: venues.length },
          { label: "Total Tables", value: venues.reduce((s, v) => s + v.tables.length, 0) },
          { label: "Total Seats",  value: venues.reduce((s, v) => s + totalSeats(v.tables), 0) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>
              {stat.label}
            </p>
            <p className="text-2xl text-white font-medium">{stat.value}</p>
          </div>
        ))}
      </div>

      {venues.length === 0 && (
        <div className="text-center py-16 text-white/20 text-[13px]">
          No venues yet — add your first one
        </div>
      )}

      {/* Venue list */}
      <div className="flex flex-col gap-3">
        {venues.map((venue) => (
          <div key={venue.$id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Venue row */}
            <div className="flex items-center gap-4 px-5 py-4">
              <button
                onClick={() => setExpanded((p) => p === venue.$id ? null : venue.$id)}
                className="text-white/40 hover:text-white/70 transition-colors cursor-pointer"
              >
                {expandedVenue === venue.$id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-white font-medium">{venue.name}</span>
                  <span className="text-[10px] text-white/30 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                    /{venue.slug}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${venue.is_active ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"}`}>
                    {venue.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[12px] text-white/30 mt-0.5">
                  {venue.description} · {venue.tables.length} tables · {totalSeats(venue.tables)} seats
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleVenue(venue.$id, venue.is_active)}
                  className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"
                  disabled={isPending}
                >
                  {venue.is_active ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                </button>
                <button
                  onClick={() => handleDeleteVenue(venue.$id)}
                  className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"
                  disabled={isPending}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Tables */}
            {expandedVenue === venue.$id && (
              <div className="border-t border-white/[0.06] px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-white/30 uppercase tracking-wider" style={{ fontFamily: "var(--font-cinzel)" }}>
                    Tables
                  </p>
                  <button
                    onClick={() => setShowTable(venue.$id)}
                    className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors cursor-pointer"
                  >
                    <Plus size={12} /> Add Table
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {venue.tables.map((table: any) => (
                    <div key={table.$id} className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] text-white/80">Table {table.table_number}</span>
                          <span className="text-[11px] text-white/30">{table.seat_count} seats</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${table.is_active ? "border-green-500/20 text-green-400/70" : "border-red-500/20 text-red-400/70"}`}>
                            {table.is_active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleGenerateQRs(venue.$id, table.$id, venue.slug, table.table_number)}
                          className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/60 hover:text-[#c9a84c] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 px-2.5 py-1 rounded transition-colors cursor-pointer"
                          disabled={isPending}
                        >
                          <QrCode size={12} /> Generate QRs
                        </button>
                        <button
                          onClick={() => handleToggleTable(venue.$id, table.$id, table.is_active)}
                          className="text-white/20 hover:text-white/50 cursor-pointer"
                          disabled={isPending}
                        >
                          {table.is_active ? <ToggleRight size={16} className="text-green-400/60" /> : <ToggleLeft size={16} />}
                        </button>
                        <button
                          onClick={() => handleDeleteTable(venue.$id, table.$id)}
                          className="text-white/20 hover:text-red-400/70 cursor-pointer"
                          disabled={isPending}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))}
                  {venue.tables.length === 0 && (
                    <p className="text-[12px] text-white/20 italic py-2">No tables added yet</p>
                  )}
                </div>

                {showAddTable === venue.$id && (
                  <AddTableForm
                    onClose={() => setShowTable(null)}
                    onAdd={async (tableNumber, seatCount) => {
                      const { table } = await createTable({
                        venue_id:     venue.$id,
                        table_number: tableNumber,
                        seat_count:   seatCount,
                      });
                      setVenues((p) =>
                        p.map((v) => v.$id === venue.$id ? { ...v, tables: [...v.tables, table] } : v)
                      );
                      setShowTable(null);
                    }}
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {showAddVenue && (
        <AddVenueModal
          onClose={() => setShowAdd(false)}
          onAdd={async (data) => {
            const { venue } = await createVenue(data);
            setVenues((p) => [...p, { ...venue, tables: [] }]);
            setShowAdd(false);
          }}
        />
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="p-8 flex items-center gap-3 text-white/30">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-[13px]">Loading venues…</span>
    </div>
  );
}

function AddTableForm({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (tableNumber: number, seatCount: number) => Promise<void>;
}) {
  const [tableNumber, setTableNumber] = useState("");
  const [seatCount, setSeatCount]     = useState("");
  const [saving, setSaving]           = useState(false);

  const handle = async () => {
    if (!tableNumber || !seatCount) return;
    setSaving(true);
    await onAdd(parseInt(tableNumber), parseInt(seatCount));
    setSaving(false);
  };

  return (
    <div className="mt-3 flex items-end gap-3 bg-white/[0.02] border border-[#c9a84c]/15 rounded-lg px-4 py-3">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-white/30">Table number</label>
        <input type="number" value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} placeholder="e.g. 5"
          className="w-24 bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-white/30">Seats</label>
        <input type="number" value={seatCount} onChange={(e) => setSeatCount(e.target.value)} placeholder="e.g. 4"
          className="w-24 bg-white/[0.05] border border-white/[0.08] rounded-md px-3 py-1.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
      </div>
      <button
        onClick={handle}
        disabled={saving}
        className="flex items-center gap-1.5 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[12px] px-3 py-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-50"
      >
        {saving && <Loader2 size={12} className="animate-spin" />} Add
      </button>
      <button onClick={onClose} className="text-white/30 hover:text-white/60 text-[12px] px-3 py-1.5 cursor-pointer">Cancel</button>
    </div>
  );
}

function AddVenueModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: { name: string; slug: string; description: string; theme: string }) => Promise<void>;
}) {
  const [name, setName]         = useState("");
  const [slug, setSlug]         = useState("");
  const [desc, setDesc]         = useState("");
  const [theme, setTheme]       = useState("restaurant");
  const [saving, setSaving]     = useState(false);

  // Auto-generate slug from name
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
  };

  const handle = async () => {
    if (!name || !slug) return;
    setSaving(true);
    await onAdd({ name, slug, description: desc, theme });
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl p-6 w-[440px]">
        <h2 className="text-[14px] text-white mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
          Add New Venue
        </h2>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Venue name</label>
            <input value={name} onChange={(e) => handleNameChange(e.target.value)} placeholder="e.g. Garden Area"
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Slug (URL path)</label>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="e.g. garden"
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 font-mono" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Description</label>
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Outdoor garden seating"
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40">
              <option value="restaurant">Restaurant</option>
              <option value="pool">Pool</option>
              <option value="lobby">Lobby Café</option>
              <option value="event">Event</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={handle}
            disabled={saving || !name || !slug}
            className="flex-1 flex items-center justify-center gap-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[13px] py-2 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {saving && <Loader2 size={13} className="animate-spin" />} Save Venue
          </button>
          <button onClick={onClose} className="px-4 text-white/30 hover:text-white/60 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Temporary debug component
// Add this to app/admin/venues/page.tsx temporarily at the top of the component
// to see what's happening

// "use client";

// import { useEffect } from "react";
// import { db, DB_ID, COLLECTIONS } from "@/lib/appwrite";

// export default function DebugPage() {
//   useEffect(() => {
//     async function test() {
//       console.log("=== DEBUG ===");
//       console.log("DB_ID:", DB_ID);
//       console.log("COLLECTIONS:", COLLECTIONS);
      
//       try {
//         const res = await db.listDocuments(DB_ID, COLLECTIONS.VENUES);
//         console.log("Venues response:", res);
//         console.log("Venues count:", res.total);
//         console.log("Venues:", res.documents);
//       } catch (err: any) {
//         console.error("Venues error:", err.message);
//         console.error("Venues error code:", err.code);
//         console.error("Venues error type:", err.type);
//       }
//     }
//     test();
//   }, []);

//   return (
//     <div className="p-8">
//       <p className="text-white">Check browser console for debug info</p>
//     </div>
//   );
// }