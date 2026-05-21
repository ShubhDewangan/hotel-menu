"use client";

import { useState } from "react";
import { Download, QrCode, Search, ChevronDown, ChevronRight, CheckSquare, Square } from "lucide-react";
import VenueQRCard from "@/components/ui/VenueQRcard";

type Seat = {
  id: string;
  seatNumber: number;
  slug: string;
  generated: boolean;
};

type Table = {
  id: string;
  tableNumber: number;
  seats: Seat[];
};

type VenueQR = {
  id: string;
  name: string;
  slug: string;
  accentColor: string;
  tables: Table[];
};

const mockVenues: VenueQR[] = [
  {
    id: "v1", name: "Restaurant", slug: "restaurant", accentColor: "#c9a84c",
    tables: [
      {
        id: "t1", tableNumber: 1,
        seats: [
          { id: "s1", seatNumber: 1, slug: "restaurant-t1-s1", generated: true },
          { id: "s2", seatNumber: 2, slug: "restaurant-t1-s2", generated: true },
          { id: "s3", seatNumber: 3, slug: "restaurant-t1-s3", generated: false },
          { id: "s4", seatNumber: 4, slug: "restaurant-t1-s4", generated: false },
        ],
      },
      {
        id: "t2", tableNumber: 2,
        seats: [
          { id: "s5", seatNumber: 1, slug: "restaurant-t2-s1", generated: true },
          { id: "s6", seatNumber: 2, slug: "restaurant-t2-s2", generated: true },
        ],
      },
    ],
  },
  {
    id: "v2", name: "Pool Side", slug: "pool", accentColor: "#5bb8d4",
    tables: [
      {
        id: "t3", tableNumber: 1,
        seats: [
          { id: "s7", seatNumber: 1, slug: "pool-t1-s1", generated: false },
          { id: "s8", seatNumber: 2, slug: "pool-t1-s2", generated: false },
          { id: "s9", seatNumber: 3, slug: "pool-t1-s3", generated: false },
          { id: "s10", seatNumber: 4, slug: "pool-t1-s4", generated: false },
        ],
      },
    ],
  },
  {
    id: "v3", name: "Lobby Café", slug: "lobby", accentColor: "#d4af6a",
    tables: [
      {
        id: "t4", tableNumber: 1,
        seats: [
          { id: "s11", seatNumber: 1, slug: "lobby-t1-s1", generated: true },
          { id: "s12", seatNumber: 2, slug: "lobby-t1-s2", generated: false },
        ],
      },
    ],
  },
];

export default function QRCodesPage() {
  const [venues, setVenues]             = useState(mockVenues);
  const [expandedVenue, setExpanded]    = useState<string | null>("v1");
  const [expandedTable, setExpandedTbl] = useState<string | null>("t1");
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<Set<string>>(new Set());

  const totalSeats     = venues.reduce((s, v) => s + v.tables.reduce((ts, t) => ts + t.seats.length, 0), 0);
  const generatedSeats = venues.reduce((s, v) => s + v.tables.reduce((ts, t) => ts + t.seats.filter((seat) => seat.generated).length, 0), 0);

  const markGenerated = (venueId: string, tableId: string, seatIds: string[]) => {
    setVenues((p) =>
      p.map((v) =>
        v.id === venueId
          ? {
              ...v,
              tables: v.tables.map((t) =>
                t.id === tableId
                  ? { ...t, seats: t.seats.map((s) => seatIds.includes(s.id) ? { ...s, generated: true } : s) }
                  : t
              ),
            }
          : v
      )
    );
  };

  const toggleSelect = (id: string) => {
    setSelected((p) => {
      const next = new Set(p);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const filteredVenues = venues.map((v) => ({
    ...v,
    tables: v.tables.map((t) => ({
      ...t,
      seats: t.seats.filter((s) =>
        search === "" || s.slug.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter((t) => t.seats.length > 0 || search === ""),
  })).filter((v) => v.tables.length > 0 || search === "");

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl text-white font-medium" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
            QR Codes
          </h1>
          <p className="text-[13px] text-white/40 mt-1">
            Generate and download QR codes for every seat across all venues
          </p>
        </div>
        <button
          disabled={selected.size === 0}
          className="flex items-center gap-2 text-[13px] px-4 py-2 rounded-lg border transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ background: "#c9a84c15", borderColor: "#c9a84c40", color: "#e8d59a" }}
        >
          <Download size={14} /> Download Selected ({selected.size})
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Seats",     value: totalSeats },
          { label: "QRs Generated",   value: generatedSeats },
          { label: "Pending",         value: totalSeats - generatedSeats },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>{s.label}</p>
            <p className="text-2xl text-white font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Preview cards — generated QRs */}
      <div className="mb-8">
        <p className="text-[11px] text-white/30 uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-cinzel)" }}>
          Preview
        </p>
        <div className="flex gap-4 flex-wrap">
          {venues.map((v) =>
            v.tables.slice(0, 1).map((t) =>
              t.seats.filter((s) => s.generated).slice(0, 2).map((s) => (
                <VenueQRCard
                  key={s.id}
                  name={v.name}
                  area={`Table ${t.tableNumber} · Seat ${s.seatNumber}`}
                  tag={`/${s.slug}`}
                  accentColor={v.accentColor}
                />
              ))
            )
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by slug…"
          className="w-full max-w-sm bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40"
        />
      </div>

      {/* Venue → Table → Seat tree */}
      <div className="flex flex-col gap-3">
        {filteredVenues.map((venue) => (
          <div key={venue.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Venue header */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpanded((p) => p === venue.id ? null : venue.id)}
            >
              <span className="text-white/40">
                {expandedVenue === venue.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: venue.accentColor }} />
              <span className="flex-1 text-[14px] text-white font-medium">{venue.name}</span>
              <span className="text-[11px] text-white/30">
                {venue.tables.reduce((s, t) => s + t.seats.filter((seat) => seat.generated).length, 0)}
                /{venue.tables.reduce((s, t) => s + t.seats.length, 0)} generated
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); markGenerated(venue.id, venue.tables[0]?.id, venue.tables.flatMap((t) => t.seats.map((s) => s.id))); }}
                className="flex items-center gap-1.5 text-[11px] border px-2.5 py-1 rounded transition-colors cursor-pointer ml-2"
                style={{ color: `${venue.accentColor}99`, borderColor: `${venue.accentColor}30` }}
              >
                <QrCode size={11} /> Generate All
              </button>
            </div>

            {/* Tables */}
            {expandedVenue === venue.id && (
              <div className="border-t border-white/[0.06]">
                {venue.tables.map((table) => (
                  <div key={table.id} className="border-b border-white/[0.04] last:border-0">
                    {/* Table row */}
                    <div
                      className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-white/[0.01] transition-colors"
                      onClick={() => setExpandedTbl((p) => p === table.id ? null : table.id)}
                    >
                      <span className="text-white/30 text-[13px]">
                        {expandedTable === table.id ? "▾" : "▸"}
                      </span>
                      <span className="flex-1 text-[13px] text-white/70">Table {table.tableNumber}</span>
                      <span className="text-[11px] text-white/30">
                        {table.seats.filter((s) => s.generated).length}/{table.seats.length} seats
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); markGenerated(venue.id, table.id, table.seats.map((s) => s.id)); }}
                        className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/50 hover:text-[#c9a84c] cursor-pointer ml-2"
                      >
                        <QrCode size={11} /> Generate
                      </button>
                    </div>

                    {/* Seats */}
                    {expandedTable === table.id && (
                      <div className="px-8 pb-3 grid grid-cols-1 gap-1.5">
                        {table.seats.map((seat) => (
                          <div key={seat.id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2.5">
                            <button onClick={() => toggleSelect(seat.id)} className="text-white/30 hover:text-white/60 cursor-pointer flex-shrink-0">
                              {selected.has(seat.id) ? <CheckSquare size={14} className="text-[#c9a84c]" /> : <Square size={14} />}
                            </button>
                            <div className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: venue.accentColor, opacity: seat.generated ? 1 : 0.3 }} />
                            <span className="flex-1 text-[12px] text-white/60 font-mono">{seat.slug}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded border ${seat.generated ? "border-green-500/20 text-green-400/70 bg-green-500/10" : "border-white/[0.08] text-white/25"}`}>
                              {seat.generated ? "Generated" : "Pending"}
                            </span>
                            <button className="text-white/20 hover:text-white/60 cursor-pointer" disabled={!seat.generated}>
                              <Download size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}