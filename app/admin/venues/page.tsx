"use client";

import { useState } from "react";
import {
  Plus, ChevronDown, ChevronRight, QrCode,
  Pencil, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";

const mockVenues = [
  {
    id: "v1", name: "Restaurant", slug: "restaurant", menuLabel: "Restaurant Menu",
    description: "Main dining hall", isActive: true,
    tables: [
      { id: "t1", tableNumber: 1, seatCount: 4, isActive: true },
      { id: "t2", tableNumber: 2, seatCount: 2, isActive: true },
      { id: "t3", tableNumber: 3, seatCount: 6, isActive: false },
    ],
  },
  {
    id: "v2", name: "Pool Side", slug: "pool", menuLabel: "Pool Menu",
    description: "Outdoor pool deck", isActive: true,
    tables: [
      { id: "t4", tableNumber: 1, seatCount: 4, isActive: true },
      { id: "t5", tableNumber: 2, seatCount: 4, isActive: true },
    ],
  },
  {
    id: "v3", name: "Lobby Café", slug: "lobby", menuLabel: "Lobby Café Menu",
    description: "Ground floor lounge", isActive: true,
    tables: [
      { id: "t6", tableNumber: 1, seatCount: 2, isActive: true },
    ],
  },
];

type Venue = typeof mockVenues[0];
type Table = typeof mockVenues[0]["tables"][0];

export default function VenuesPage() {
  const [venues, setVenues]           = useState(mockVenues);
  const [expandedVenue, setExpanded]  = useState<string | null>("v1");
  const [showAddVenue, setShowAdd]    = useState(false);
  const [showAddTable, setShowTable]  = useState<string | null>(null);

  const toggleVenue = (id: string) =>
    setExpanded((p) => (p === id ? null : id));

  const toggleVenueActive = (id: string) =>
    setVenues((p) => p.map((v) => v.id === id ? { ...v, isActive: !v.isActive } : v));

  const toggleTableActive = (venueId: string, tableId: string) =>
    setVenues((p) =>
      p.map((v) =>
        v.id === venueId
          ? { ...v, tables: v.tables.map((t) => t.id === tableId ? { ...t, isActive: !t.isActive } : t) }
          : v
      )
    );

  const totalSeats = (tables: Table[]) => tables.reduce((s, t) => s + t.seatCount, 0);

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

      {/* Venue list */}
      <div className="flex flex-col gap-3">
        {venues.map((venue) => (
          <div key={venue.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Venue row */}
            <div className="flex items-center gap-4 px-5 py-4">
              <button onClick={() => toggleVenue(venue.id)} className="text-white/40 hover:text-white/70 transition-colors cursor-pointer">
                {expandedVenue === venue.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </button>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-[14px] text-white font-medium">{venue.name}</span>
                  <span className="text-[10px] text-white/30 font-mono bg-white/[0.04] px-2 py-0.5 rounded">
                    /{venue.slug}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${venue.isActive ? "border-green-500/30 text-green-400 bg-green-500/10" : "border-red-500/30 text-red-400 bg-red-500/10"}`}>
                    {venue.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <p className="text-[12px] text-white/30 mt-0.5">
                  {venue.description} · {venue.menuLabel} · {venue.tables.length} tables · {totalSeats(venue.tables)} seats
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleVenueActive(venue.id)} className="text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                  {venue.isActive ? <ToggleRight size={18} className="text-green-400" /> : <ToggleLeft size={18} />}
                </button>
                <button className="text-white/30 hover:text-white/60 transition-colors cursor-pointer"><Pencil size={14} /></button>
                <button className="text-white/30 hover:text-red-400 transition-colors cursor-pointer"><Trash2 size={14} /></button>
              </div>
            </div>

            {/* Tables */}
            {expandedVenue === venue.id && (
              <div className="border-t border-white/[0.06] px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-white/30 uppercase tracking-wider" style={{ fontFamily: "var(--font-cinzel)" }}>
                    Tables
                  </p>
                  <button onClick={() => setShowTable(venue.id)} className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/70 hover:text-[#c9a84c] transition-colors cursor-pointer">
                    <Plus size={12} /> Add Table
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {venue.tables.map((table) => (
                    <TableRow
                      key={table.id}
                      table={table}
                      venueName={venue.name}
                      onToggle={() => toggleTableActive(venue.id, table.id)}
                    />
                  ))}
                  {venue.tables.length === 0 && (
                    <p className="text-[12px] text-white/20 italic py-2">No tables added yet</p>
                  )}
                </div>
                {showAddTable === venue.id && (
                  <AddTableForm
                    onClose={() => setShowTable(null)}
                    onAdd={(tableNumber, seatCount) => {
                      setVenues((p) =>
                        p.map((v) =>
                          v.id === venue.id
                            ? { ...v, tables: [...v.tables, { id: `t${Date.now()}`, tableNumber, seatCount, isActive: true }] }
                            : v
                        )
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

      {showAddVenue && <AddVenueModal onClose={() => setShowAdd(false)} />}
    </div>
  );
}

function TableRow({ table, venueName, onToggle }: { table: Table; venueName: string; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-4 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-3">
      <div className="flex-1">
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-white/80">Table {table.tableNumber}</span>
          <span className="text-[11px] text-white/30">{table.seatCount} seats</span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${table.isActive ? "border-green-500/20 text-green-400/70" : "border-red-500/20 text-red-400/70"}`}>
            {table.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="text-[11px] text-white/20 mt-0.5 font-mono">
          {venueName} · {table.seatCount} QR code{table.seatCount !== 1 ? "s" : ""} needed
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/60 hover:text-[#c9a84c] border border-[#c9a84c]/20 hover:border-[#c9a84c]/40 px-2.5 py-1 rounded transition-colors cursor-pointer">
          <QrCode size={12} /> Generate QRs
        </button>
        <button onClick={onToggle} className="text-white/20 hover:text-white/50 transition-colors cursor-pointer">
          {table.isActive ? <ToggleRight size={16} className="text-green-400/60" /> : <ToggleLeft size={16} />}
        </button>
        <button className="text-white/20 hover:text-white/50 transition-colors cursor-pointer"><Pencil size={13} /></button>
        <button className="text-white/20 hover:text-red-400/70 transition-colors cursor-pointer"><Trash2 size={13} /></button>
      </div>
    </div>
  );
}

function AddTableForm({ onClose, onAdd }: { onClose: () => void; onAdd: (tableNumber: number, seatCount: number) => void }) {
  const [tableNumber, setTableNumber] = useState("");
  const [seatCount, setSeatCount]     = useState("");

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
      <button onClick={() => { if (tableNumber && seatCount) onAdd(parseInt(tableNumber), parseInt(seatCount)); }}
        className="bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[12px] px-3 py-1.5 rounded-md transition-colors cursor-pointer">
        Add
      </button>
      <button onClick={onClose} className="text-white/30 hover:text-white/60 text-[12px] px-3 py-1.5 cursor-pointer">
        Cancel
      </button>
    </div>
  );
}

function AddVenueModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0f1117] border border-white/[0.08] rounded-2xl p-6 w-[440px]">
        <h2 className="text-[14px] text-white mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
          Add New Venue
        </h2>
        <div className="flex flex-col gap-4">
          {[
            { label: "Venue name",  placeholder: "e.g. Garden Area" },
            { label: "Slug",        placeholder: "e.g. garden (used in URL)" },
            { label: "Description", placeholder: "e.g. Outdoor garden seating" },
          ].map((field) => (
            <div key={field.label} className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">{field.label}</label>
              <input placeholder={field.placeholder}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40" />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] text-white/40">Menu</label>
            <select className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white outline-none focus:border-[#c9a84c]/40">
              <option value="restaurant">Restaurant Menu</option>
              <option value="pool">Pool Menu</option>
              <option value="lobby">Lobby Café Menu</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[13px] py-2 rounded-lg transition-colors cursor-pointer">
            Save Venue
          </button>
          <button onClick={onClose} className="px-4 text-white/30 hover:text-white/60 text-[13px] cursor-pointer">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}