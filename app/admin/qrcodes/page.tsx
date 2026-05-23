"use client";

import { useEffect, useState, useTransition, useRef } from "react";
import { Download, QrCode, Search, ChevronDown, ChevronRight, CheckSquare, Square, Loader2 } from "lucide-react";
import VenueQRCard from "@/components/ui/VenueQRcard";
import QRCode from "qrcode";
import {
  listVenues,
  listTablesByVenue,
  listSeatsByTable,
  generateQRCodeForSeat,
  uploadQRImage,
  listQRCodesByVenue,
} from "@/lib/actions/admin.actions";
import type { VenueDoc, TableDoc, SeatDoc, QRCodeDoc } from "@/types/appwrite";

type SeatWithQR = SeatDoc & { qr: QRCodeDoc | null };
type TableWithSeats = TableDoc & { seats: SeatWithQR[] };
type VenueWithData  = VenueDoc & { tables: TableWithSeats[] };

const ACCENT: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#5bb8d4",
  lobby:      "#d4af6a",
};

export default function QRCodesPage() {
  const [venues, setVenues]             = useState<VenueWithData[]>([]);
  const [loading, setLoading]           = useState(true);
  const [expandedVenue, setExpanded]    = useState<string | null>(null);
  const [expandedTable, setExpandedTbl] = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [selected, setSelected]         = useState<Set<string>>(new Set());
  const [isPending, startTransition]    = useTransition();
  const [generating, setGenerating]     = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const vs = await listVenues();
      const full: VenueWithData[] = await Promise.all(
        vs.map(async (v) => {
          const tables  = await listTablesByVenue(v.$id);
          // Fetch all QR codes for this venue at once
          const allQRs  = await listQRCodesByVenue(v.$id);
          // Build a map of seat_id → QRCodeDoc
          const qrBySeat: Record<string, QRCodeDoc> = {};
          for (const qr of allQRs) {
            // Keep the one with qr_image_url if multiple exist
            if (!qrBySeat[qr.seat_id] || qr.qr_image_url) {
              qrBySeat[qr.seat_id] = qr;
            }
          }
          const withSeats: TableWithSeats[] = await Promise.all(
            tables.map(async (t) => {
              const seats = await listSeatsByTable(t.$id);
              const seatsWithQR: SeatWithQR[] = seats.map((s) => ({
                ...s,
                qr: qrBySeat[s.$id] ?? null,
              }));
              return { ...t, seats: seatsWithQR };
            })
          );
          return { ...v, tables: withSeats };
        })
      );
      setVenues(full);
      if (full.length > 0) setExpanded(full[0].$id);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []); // eslint-disable-line

  const handleGenerateSingle = async (
    venue: VenueWithData,
    table: TableWithSeats,
    seat: SeatWithQR
  ) => {
    setGenerating((p) => new Set(p).add(seat.$id));
    try {
      // 1. Create QR doc in Appwrite
      const qrDoc = await generateQRCodeForSeat({
        seatId:      seat.$id,
        venueSlug:   venue.slug,
        tableNumber: table.table_number,
        seatNumber:  seat.seat_number,
      });

      // 2. Generate QR image using npm qrcode package
      const dataUrl = await QRCode.toDataURL(qrDoc.resolved_url, {
        width:  300,
        margin: 2,
        color:  { dark: "#000000", light: "#ffffff" },
      });

      // 3. Convert dataURL to blob
      const res  = await fetch(dataUrl);
      const blob = await res.blob();

      // 4. Upload to Appwrite Storage
      const updated = await uploadQRImage(qrDoc.$id, blob, `${qrDoc.slug}.png`);

      // 5. Update local state
      setVenues((p) =>
        p.map((v) =>
          v.$id === venue.$id
            ? {
                ...v,
                tables: v.tables.map((t) =>
                  t.$id === table.$id
                    ? { ...t, seats: t.seats.map((s) => s.$id === seat.$id ? { ...s, qr: updated } : s) }
                    : t
                ),
              }
            : v
        )
      );
    } catch (err) {
      console.error("QR generation failed", err);
      alert("QR generation failed — check console.");
    } finally {
      setGenerating((p) => { const next = new Set(p); next.delete(seat.$id); return next; });
    }
  };

  // Generate QRs for all seats in a table
  const handleGenerateTable = async (venue: VenueWithData, table: TableWithSeats) => {
    for (const seat of table.seats) {
      if (!seat.qr) await handleGenerateSingle(venue, table, seat);
    }
  };

  // Download a single QR image
  const handleDownload = (qr: QRCodeDoc, label: string) => {
    if (!qr.qr_image_url) return;
    const a  = document.createElement("a");
    a.href   = qr.qr_image_url;
    a.download = `${label}.png`;
    a.click();
  };

  const toggleSelect = (id: string) =>
    setSelected((p) => { const next = new Set(p); next.has(id) ? next.delete(id) : next.add(id); return next; });

  const totalSeats     = venues.reduce((s, v) => s + v.tables.reduce((ts, t) => ts + t.seats.length, 0), 0);
  const generatedSeats = venues.reduce((s, v) => s + v.tables.reduce((ts, t) => ts + t.seats.filter((seat) => !!seat.qr).length, 0), 0);

  const filteredVenues = venues.map((v) => ({
    ...v,
    tables: v.tables.map((t) => ({
      ...t,
      seats: t.seats.filter((s) =>
        search === "" || `${v.slug}-t${t.table_number}-s${s.seat_number}`.toLowerCase().includes(search.toLowerCase())
      ),
    })).filter((t) => t.seats.length > 0 || search === ""),
  })).filter((v) => v.tables.length > 0 || search === "");

  if (loading) return (
    <div className="p-8 flex items-center gap-3 text-white/30">
      <Loader2 size={16} className="animate-spin" />
      <span className="text-[13px]">Loading QR codes…</span>
    </div>
  );

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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Total Seats",   value: totalSeats },
          { label: "QRs Generated", value: generatedSeats },
          { label: "Pending",       value: totalSeats - generatedSeats },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl px-5 py-4">
            <p className="text-[11px] text-white/30 uppercase tracking-wider mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>{s.label}</p>
            <p className="text-2xl text-white font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Preview — generated QRs */}
      {generatedSeats > 0 && (
        <div className="mb-8">
          <p className="text-[11px] text-white/30 uppercase tracking-wider mb-4" style={{ fontFamily: "var(--font-cinzel)" }}>Preview</p>
          <div className="flex gap-4 flex-wrap">
            {venues.flatMap((v) =>
              v.tables.flatMap((t) =>
                t.seats.filter((s) => s.qr?.qr_image_url).slice(0, 2).map((s) => (
                  <VenueQRCard
                    key={s.$id}
                    name={v.name}
                    area={`Table ${t.table_number} · Seat ${s.seat_number}`}
                    tag={`/${v.slug}-t${t.table_number}-s${s.seat_number}`}
                    accentColor={ACCENT[v.slug] ?? "#c9a84c"}
                    qrImageUrl={s.qr?.qr_image_url ?? undefined}
                  />
                ))
              )
            )}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative mb-5">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter by venue / table…"
          className="w-full max-w-sm bg-white/[0.03] border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40"
        />
      </div>

      {/* Tree */}
      <div className="flex flex-col gap-3">
        {filteredVenues.map((venue) => (
          <div key={venue.$id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl overflow-hidden">
            {/* Venue row */}
            <div
              className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors"
              onClick={() => setExpanded((p) => p === venue.$id ? null : venue.$id)}
            >
              <span className="text-white/40">
                {expandedVenue === venue.$id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: ACCENT[venue.slug] ?? "#c9a84c" }} />
              <span className="flex-1 text-[14px] text-white font-medium">{venue.name}</span>
              <span className="text-[11px] text-white/30">
                {venue.tables.reduce((s, t) => s + t.seats.filter((s) => !!s.qr).length, 0)}
                /{venue.tables.reduce((s, t) => s + t.seats.length, 0)} generated
              </span>
            </div>

            {/* Tables */}
            {expandedVenue === venue.$id && (
              <div className="border-t border-white/[0.06]">
                {venue.tables.map((table) => (
                  <div key={table.$id} className="border-b border-white/[0.04] last:border-0">
                    <div
                      className="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-white/[0.01]"
                      onClick={() => setExpandedTbl((p) => p === table.$id ? null : table.$id)}
                    >
                      <span className="text-white/30 text-[13px]">{expandedTable === table.$id ? "▾" : "▸"}</span>
                      <span className="flex-1 text-[13px] text-white/70">Table {table.table_number}</span>
                      <span className="text-[11px] text-white/30">
                        {table.seats.filter((s) => !!s.qr).length}/{table.seats.length} seats
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleGenerateTable(venue, table); }}
                        className="flex items-center gap-1.5 text-[11px] text-[#c9a84c]/50 hover:text-[#c9a84c] cursor-pointer ml-2"
                        disabled={isPending}
                      >
                        <QrCode size={11} /> Generate All
                      </button>
                    </div>

                    {expandedTable === table.$id && (
                      <div className="px-8 pb-3 grid grid-cols-1 gap-1.5">
                        {table.seats.map((seat) => {
                          const isGen = !!seat.qr;
                          const isLoading = generating.has(seat.$id);
                          return (
                            <div key={seat.$id} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.04] rounded-lg px-4 py-2.5">
                              <button onClick={() => toggleSelect(seat.$id)} className="text-white/30 hover:text-white/60 cursor-pointer flex-shrink-0">
                                {selected.has(seat.$id) ? <CheckSquare size={14} className="text-[#c9a84c]" /> : <Square size={14} />}
                              </button>
                              <div className="w-[9px] h-[9px] rounded-full flex-shrink-0" style={{ background: ACCENT[venue.slug] ?? "#c9a84c", opacity: isGen ? 1 : 0.3 }} />
                              <span className="flex-1 text-[12px] text-white/60 font-mono">
                                {venue.slug}-t{table.table_number}-s{seat.seat_number}
                              </span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded border ${isGen ? "border-green-500/20 text-green-400/70 bg-green-500/10" : "border-white/[0.08] text-white/25"}`}>
                                {isGen ? "Generated" : "Pending"}
                              </span>
                              {!isGen && (
                                <button
                                  onClick={() => handleGenerateSingle(venue, table, seat)}
                                  disabled={isLoading}
                                  className="flex items-center gap-1 text-[11px] text-[#c9a84c]/50 hover:text-[#c9a84c] cursor-pointer"
                                >
                                  {isLoading ? <Loader2 size={11} className="animate-spin" /> : <QrCode size={11} />}
                                  {isLoading ? "Generating…" : "Generate"}
                                </button>
                              )}
                              {isGen && seat.qr && (
                                <button
                                  onClick={() => handleDownload(seat.qr!, `${venue.slug}-t${table.table_number}-s${seat.seat_number}`)}
                                  className="text-white/20 hover:text-white/60 cursor-pointer"
                                >
                                  <Download size={13} />
                                </button>
                              )}
                            </div>
                          );
                        })}
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