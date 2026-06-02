/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition } from "react";
import { Plus, ChevronDown, ChevronRight, QrCode, Trash2, ToggleLeft, ToggleRight, Loader2, CheckCircle2, Download, RefreshCw } from "lucide-react";
import QRCode from "qrcode";
import {
  listVenues, createVenue, toggleVenueActive, deleteVenue,
  listTablesByVenue, createTable, toggleTableActive, deleteTableWithQR,
  getQRForTable, generateQRForTable, uploadQRImage,
} from "@/lib/actions/admin.actions";
import type { VenueDoc, TableDoc, QRCodeDoc } from "@/types/appwrite";
import Image from 'next/image'

type TableWithQR    = TableDoc & { qr: QRCodeDoc | null; generating: boolean };
type VenueWithTables = VenueDoc & { tables: TableWithQR[] | null; loading: boolean };

const THEME_COLORS: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#5bb8d4",
  lobby:      "#d4af6a",
  event:      "#b07fd4",
};

export default function VenuesPage() {
  const [venues, setVenues]          = useState<VenueWithTables[]>([]);
  const [loading, setLoading]        = useState(true);
  const [expandedVenue, setExpanded] = useState<string | null>(null);
  const [showAddVenue, setShowAdd]   = useState(false);
  const [showAddTable, setShowTable] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showQR, setShowQR]          = useState<boolean>(false)
  const [QR, sendQR]                 = useState<string | null>(null)

  useEffect(() => {
    listVenues().then((vs) => {
      setVenues(vs.map((v) => ({ ...v, tables: null, loading: false })));
      setLoading(false);
    });
  }, []);


  const handleExpand = async (venueId: string) => {
    if (expandedVenue === venueId) { setExpanded(null); return; }
    setExpanded(venueId);
    const venue = venues.find((v) => v.$id === venueId);
    if (venue?.tables !== null) return;

    setVenues((p) => p.map((v) => v.$id === venueId ? { ...v, loading: true } : v));
    const tables = await listTablesByVenue(venueId);

    // Fetch existing QR for each table
    const tablesWithQR: TableWithQR[] = await Promise.all(
      tables.map(async (t) => {
        const qr = await getQRForTable(t.$id);
        return { ...t, qr, generating: false };
      })
    );

    setVenues((p) => p.map((v) => v.$id === venueId ? { ...v, tables: tablesWithQR, loading: false } : v));
  };

  const handleToggleVenue = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleVenueActive(id, !current);
      setVenues((p) => p.map((v) => v.$id === id ? { ...v, is_active: !current } : v));
    });
  };

  const handleDeleteVenue = (id: string) => {
    if (!confirm("Delete this venue and all its tables and QR codes?")) return;
    startTransition(async () => {
      await deleteVenue(id);
      setVenues((p) => p.filter((v) => v.$id !== id));
    });
  };

  const handleToggleTable = (venueId: string, tableId: string, current: boolean) => {
    startTransition(async () => {
      await toggleTableActive(tableId, !current);
      setVenues((p) => p.map((v) =>
        v.$id === venueId
          ? { ...v, tables: v.tables?.map((t) => t.$id === tableId ? { ...t, is_active: !current } : t) ?? null }
          : v
      ));
    });
  };

  const handleDeleteTable = (venueId: string, tableId: string) => {
    if (!confirm("Delete this table and its QR code?")) return;
    startTransition(async () => {
      await deleteTableWithQR(tableId);
      setVenues((p) => p.map((v) =>
        v.$id === venueId ? { ...v, tables: v.tables?.filter((t) => t.$id !== tableId) ?? null } : v
      ));
    });
  };

  // Generate or regenerate QR for a single table
  const handleGenerateQR = async (venueId: string, venueSlug: string, tableId: string, tableNumber: number, regenerate = false) => {
    // Mark as generating
    setVenues((p) => p.map((v) =>
      v.$id === venueId
        ? { ...v, tables: v.tables?.map((t) => t.$id === tableId ? { ...t, generating: true } : t) ?? null }
        : v
    ));

    try {
      const qrDoc   = await generateQRForTable({ tableId, venueSlug, tableNumber, regenerate });
      const dataUrl = await QRCode.toDataURL(qrDoc.resolved_url, {
        width: 512, margin: 2, color: { dark: "#000000", light: "#ffffff" },
      });
      const blob    = await (await fetch(dataUrl)).blob();
      const updated = await uploadQRImage(qrDoc.$id, blob, `${qrDoc.slug}.png`);

      setVenues((p) => p.map((v) =>
        v.$id === venueId
          ? { ...v, tables: v.tables?.map((t) => t.$id === tableId ? { ...t, qr: updated, generating: false } : t) ?? null }
          : v
      ));
    } catch (err) {
      console.error("QR generation failed", err);
      setVenues((p) => p.map((v) =>
        v.$id === venueId
          ? { ...v, tables: v.tables?.map((t) => t.$id === tableId ? { ...t, generating: false } : t) ?? null }
          : v
      ));
    }
  };

  const handleDownload = (qr: QRCodeDoc, label: string) => {
    if (!qr.qr_image_url) return;
    const a = document.createElement("a");
    a.href = qr.qr_image_url; a.download = `${label}.png`; a.click();
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <div className="flex items-center gap-3 text-white/20">
        <Loader2 size={18} className="animate-spin" />
        <span className="text-[13px]">Loading…</span>
      </div>
    </div>
  );

  const totalTables = venues.reduce((s, v) => s + (v.tables?.length ?? 0), 0);
  const totalSeats  = venues.reduce((s, v) => s + (v.tables?.reduce((ts, t) => ts + t.seat_count, 0) ?? 0), 0);
  const totalQRs    = venues.reduce((s, v) => s + (v.tables?.filter((t) => t.qr?.qr_image_url).length ?? 0), 0);

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6 overflow-y-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[18px] text-white/90 font-medium tracking-wide" style={{ fontFamily: "var(--font-cinzel)" }}>
            Venues &amp; Tables
          </h1>
          <p className="text-[12px] text-white/30 mt-0.5">Manage venues, tables and generate QR codes</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] border border-[#c9a84c]/25 bg-[#c9a84c]/08 text-[#c9a84c]/80 hover:bg-[#c9a84c]/15 hover:text-[#c9a84c] transition-all cursor-pointer">
          <Plus size={14} /> New Venue
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: "Venues",  value: venues.length },
          { label: "Tables",  value: totalTables },
          { label: "Seats",   value: totalSeats },
          { label: "QR Ready", value: totalQRs },
        ].map((s) => (
          <div key={s.label} className="bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
            <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-cinzel)" }}>{s.label}</p>
            <p className="text-[22px] text-white/80 font-medium tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      {venues.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-white/20 text-[13px] mb-3">No venues yet</p>
            <button onClick={() => setShowAdd(true)}
              className="px-4 py-2 rounded-xl text-[12px] border border-[#c9a84c]/25 bg-[#c9a84c]/08 text-[#c9a84c]/70 hover:bg-[#c9a84c]/15 cursor-pointer transition-all">
              Add your first venue
            </button>
          </div>
        </div>
      )}

      {/* Venue list */}
      <div className="flex flex-col gap-2">
        {venues.map((venue) => {
          const accent = THEME_COLORS[venue.slug] ?? THEME_COLORS.restaurant;
          const isExpanded = expandedVenue === venue.$id;
          return (
            <div key={venue.$id} className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">

              {/* Venue row */}
              <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-white/[0.02] transition-colors select-none"
                onClick={() => handleExpand(venue.$id)}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: accent, opacity: venue.is_active ? 1 : 0.3 }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px] text-white/85 font-medium">{venue.name}</span>
                    <span className="text-[10px] text-white/25 font-mono">/{venue.slug}</span>
                    {!venue.is_active && (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-red-500/20 text-red-400/50">Inactive</span>
                    )}
                  </div>
                  <p className="text-[11px] text-white/25 mt-0.5 truncate">{venue.description}</p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleToggleVenue(venue.$id, venue.is_active)} disabled={isPending}
                    className="text-white/20 hover:text-white/50 cursor-pointer transition-colors p-1">
                    {venue.is_active ? <ToggleRight size={17} className="text-green-400/60" /> : <ToggleLeft size={17} />}
                  </button>
                  <button onClick={() => handleDeleteVenue(venue.$id)} disabled={isPending}
                    className="text-white/15 hover:text-red-400/60 cursor-pointer transition-colors p-1">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="text-white/20 ml-1">
                  {venue.loading
                    ? <Loader2 size={14} className="animate-spin" />
                    : isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </div>
              </div>

              {/* Tables */}
              {isExpanded && venue.tables !== null && (
                <div className="border-t border-white/[0.05] px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[10px] text-white/25 uppercase tracking-widest" style={{ fontFamily: "var(--font-cinzel)" }}>
                      Tables — {venue.tables.length} total · {venue.tables.reduce((s, t) => s + t.seat_count, 0)} seats
                    </p>
                    <button onClick={() => setShowTable(venue.$id)}
                      className="flex items-center gap-1 text-[11px] text-white/30 hover:text-white/60 cursor-pointer transition-colors">
                      <Plus size={11} /> Add Table
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5">
                    {venue.tables.map((table) => {
                      const hasQR = !!table.qr?.qr_image_url;
                      return (
                        <div key={table.$id}
                          className={`flex items-center gap-4 rounded-xl px-4 py-3 border transition-colors ${hasQR ? "bg-white/[0.02] border-white/[0.04]" : "bg-white/[0.01] border-white/[0.03]"}`}>

                          {/* Table number badge */}
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                            style={{ background: `${accent}15`, border: `1px solid ${accent}25` }}>
                            <span className="text-[11px] font-mono font-medium" style={{ color: accent }}>{table.table_number}</span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] text-white/70">Table {table.table_number}</span>
                              <span className="text-[10px] text-white/25">{table.seat_count} seats</span>
                              {!table.is_active && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full border border-red-500/20 text-red-400/50">Inactive</span>
                              )}
                              {hasQR && (
                                <span className="flex items-center gap-1 text-[10px] text-green-400/60">
                                  <CheckCircle2 size={10} /> QR Ready
                                </span>
                              )}
                            </div>
                          </div>

                          {hasQR && table.qr?.qr_image_url && (
                            <div
                              className="w-9 h-9 rounded-lg overflow-hidden bg-white flex-shrink-0 border border-white/10 cursor-pointer"
                              onClick={() => {
                                sendQR(table.qr!.qr_image_url);
                                setShowQR(true);
                              }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={table.qr.qr_image_url}
                                alt="QR"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {/* Generate / Regenerate */}
                            <button
                              onClick={() => handleGenerateQR(venue.$id, venue.slug, table.$id, table.table_number, hasQR)}
                              disabled={table.generating || isPending}
                              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer disabled:opacity-40"
                              style={{ color: accent, borderColor: `${accent}30`, background: `${accent}08` }}>
                              {table.generating
                                ? <><Loader2 size={10} className="animate-spin" /> Generating…</>
                                : hasQR
                                  ? <><RefreshCw size={10} /> Regen</>
                                  : <><QrCode size={10} /> Generate QR</>}
                            </button>

                            {/* Download */}
                            {hasQR && table.qr && (
                              <button onClick={() => handleDownload(table.qr!, `${venue.slug}-t${table.table_number}`)}
                                className="p-1.5 rounded-lg border border-white/[0.06] text-white/25 hover:text-white/60 hover:border-white/15 transition-all cursor-pointer">
                                <Download size={12} />
                              </button>
                            )}

                            {/* Toggle */}
                            <button onClick={() => handleToggleTable(venue.$id, table.$id, table.is_active)} disabled={isPending}
                              className="text-white/20 hover:text-white/50 cursor-pointer transition-colors p-1">
                              {table.is_active ? <ToggleRight size={15} className="text-green-400/50" /> : <ToggleLeft size={15} />}
                            </button>

                            {/* Delete */}
                            <button onClick={() => handleDeleteTable(venue.$id, table.$id)} disabled={isPending}
                              className="text-white/15 hover:text-red-400/60 cursor-pointer transition-colors p-1">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {venue.tables.length === 0 && (
                      <p className="text-[12px] text-white/20 italic py-2 px-1">No tables yet</p>
                    )}
                  </div>

                  {showAddTable === venue.$id && (
                    <AddTableForm
                      onClose={() => setShowTable(null)}
                      onAdd={async (tableNumber, seatCount) => {
                        const table = await createTable({ venue_id: venue.$id, table_number: tableNumber, seat_count: seatCount });
                        setVenues((p) => p.map((v) =>
                          v.$id === venue.$id
                            ? { ...v, tables: [...(v.tables ?? []), { ...table, qr: null, generating: false }] }
                            : v
                        ));
                        setShowTable(null);
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showAddVenue && (
        <AddVenueModal
          onClose={() => setShowAdd(false)}
          onAdd={async (data) => {
            const { venue } = await createVenue(data);
            setVenues((p) => [...p, { ...venue, tables: [], loading: false }]);
            setShowAdd(false);
          }}
        />
      )}

      {showQR && QR && (
        <QRdisplay
          QRcode={QR}
          onClose={() => {
            setShowQR(false);
            sendQR(null);
          }}
        />
      )}
    </div>
  );
}

function AddTableForm({ onClose, onAdd }: { onClose: () => void; onAdd: (n: number, s: number) => Promise<void> }) {
  const [tableNumber, setTN] = useState("");
  const [seatCount, setSC]   = useState("");
  const [saving, setSaving]  = useState(false);
  return (
    <div className="mt-3 flex items-end gap-3 bg-white/[0.02] border border-white/[0.05] rounded-xl px-4 py-3">
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-white/25">Table no.</label>
        <input type="number" value={tableNumber} onChange={(e) => setTN(e.target.value)} placeholder="5"
          className="w-20 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-white/15 outline-none focus:border-white/20" />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-[10px] text-white/25">Seats</label>
        <input type="number" value={seatCount} onChange={(e) => setSC(e.target.value)} placeholder="4"
          className="w-20 bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-1.5 text-[13px] text-white placeholder-white/15 outline-none focus:border-white/20" />
      </div>
      <button onClick={async () => { if (!tableNumber || !seatCount) return; setSaving(true); await onAdd(parseInt(tableNumber), parseInt(seatCount)); setSaving(false); }}
        disabled={saving || !tableNumber || !seatCount}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c9a84c]/25 bg-[#c9a84c]/08 text-[#c9a84c]/80 text-[12px] cursor-pointer disabled:opacity-40 transition-all hover:bg-[#c9a84c]/15">
        {saving && <Loader2 size={11} className="animate-spin" />} Add
      </button>
      <button onClick={onClose} className="text-white/25 hover:text-white/50 text-[12px] cursor-pointer px-2">Cancel</button>
    </div>
  );
}

function AddVenueModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: { name: string; slug: string; description: string; theme: string }) => Promise<void>;
}) {
  const [name, setName]     = useState("");
  const [slug, setSlug]     = useState("");
  const [desc, setDesc]     = useState("");
  const [theme, setTheme]   = useState("restaurant");
  const [saving, setSaving] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-[#0d0f15] border border-white/[0.07] rounded-2xl p-6 w-[420px]">
        <h2 className="text-[14px] text-white/80 mb-5" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>Add Venue</h2>
        <div className="flex flex-col gap-3.5">
          {[
            { label: "Name", value: name, onChange: (v: string) => { setName(v); setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); }, placeholder: "e.g. Garden Area" },
            { label: "Slug", value: slug, onChange: setSlug, placeholder: "e.g. garden" },
            { label: "Description", value: desc, onChange: setDesc, placeholder: "e.g. Outdoor garden seating" },
          ].map((f) => (
            <div key={f.label} className="flex flex-col gap-1.5">
              <label className="text-[10px] text-white/30">{f.label}</label>
              <input value={f.value} onChange={(e) => f.onChange(e.target.value)} placeholder={f.placeholder}
                className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[13px] text-white placeholder-white/15 outline-none focus:border-white/15 transition-colors" />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] text-white/30">Theme</label>
            <select value={theme} onChange={(e) => setTheme(e.target.value)}
              className="bg-white/[0.04] border border-white/[0.07] rounded-xl px-3 py-2.5 text-[13px] text-white outline-none focus:border-white/15">
              <option value="restaurant">Restaurant</option>
              <option value="pool">Pool</option>
              <option value="lobby">Lobby Café</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={async () => { if (!name || !slug) return; setSaving(true); await onAdd({ name, slug, description: desc, theme }); setSaving(false); }}
            disabled={saving || !name || !slug}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-[#c9a84c]/25 bg-[#c9a84c]/08 text-[#c9a84c]/80 text-[13px] cursor-pointer disabled:opacity-40 hover:bg-[#c9a84c]/15 transition-all">
            {saving && <Loader2 size={13} className="animate-spin" />} Create Venue
          </button>
          <button onClick={onClose} className="px-4 text-white/25 hover:text-white/50 text-[13px] cursor-pointer">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function QRdisplay({ onClose, QRcode }: {
  onClose: () => void;
  QRcode: string;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center"
      onClick={onClose}           // click backdrop to dismiss
    >
      <div
        className="relative bg-white rounded-2xl p-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}   // don't close when clicking the QR itself
      >
        <Image
          src={QRcode}
          alt="QR Code"
          height={500}
          width={500}
          className="rounded-xl"
        />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full bg-black/10 text-black/50 hover:bg-black/20 hover:text-black transition-all text-[13px] cursor-pointer"
        >
          ✕
        </button>
      </div>
    </div>
  );
}