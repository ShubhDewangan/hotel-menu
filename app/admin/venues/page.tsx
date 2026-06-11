/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Plus, ChevronDown, ChevronRight, QrCode, Trash2,
  ToggleLeft, ToggleRight, Loader2, CheckCircle2,
  Download, RefreshCw, ImageIcon,
} from "lucide-react";
import QRCode from "qrcode";
import Image from "next/image";
import {
  listVenues, createVenue, toggleVenueActive, deleteVenue,
  listTablesByVenue, createTable, toggleTableActive, deleteTableWithQR,
  getQRForTable, generateQRForTable, uploadQRImage,
} from "@/lib/actions/admin.actions";
import type { VenueDoc, TableDoc, QRCodeDoc } from "@/types/appwrite";
import {
  C, PageShell, PageHeader, SectionLabel,
  inputCls, AccentBtn, PrimaryBtn, Modal, Ring, PageLoader, StatusPill,
} from "@/shared";

type TableWithQR     = TableDoc & { qr: QRCodeDoc | null; generating: boolean };
type VenueWithTables = VenueDoc & { tables: TableWithQR[] | null; loading: boolean };

const THEME_COLORS: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#3dd6a3",
  lobby:      "#9b8fd4",
  event:      "#e07d9a",
};
const THEME_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  pool:       "Pool",
  lobby:      "Lobby Café",
  event:      "Event Space",
};

/* ─── QR preview modal ───────────────────────────────── */
function QRModal({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(10,20,16,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="relative rounded-3xl p-5"
        onClick={e => e.stopPropagation()}
        style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 40px 100px rgba(0,0,0,0.2)" }}
      >
        <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
          <Image src={src} alt="QR Code" height={400} width={400} className="block" />
          <div className='bg-amber-50 h-25 w-25 rounded-xl absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2'>
            <div className="flex w-full h-full items-center justify-center">
              <Image src={'/english-logo.png'} alt="kasoori methi" height={40} width={40} className="h-20 w-fit" />
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full cursor-pointer transition-all"
          style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════ */
export default function VenuesPage() {
  const [venues, setVenues]          = useState<VenueWithTables[]>([]);
  const [loading, setLoading]        = useState(true);
  const [expandedVenue, setExpanded] = useState<string | null>(null);
  const [showAddVenue, setShowAdd]   = useState(false);
  const [showAddTable, setShowTable] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showQR, setShowQR]          = useState(false);
  const [qrSrc, setQrSrc]            = useState<string | null>(null);

  useEffect(() => {
    listVenues().then(vs => {
      setVenues(vs.map(v => ({ ...v, tables: null, loading: false })));
      setLoading(false);
    });
  }, []);

  const handleExpand = async (venueId: string) => {
    if (expandedVenue === venueId) { setExpanded(null); return; }
    setExpanded(venueId);
    const venue = venues.find(v => v.$id === venueId);
    if (venue?.tables !== null) return;
    setVenues(p => p.map(v => v.$id === venueId ? { ...v, loading: true } : v));
    const tables = await listTablesByVenue(venueId);
    const tablesWithQR: TableWithQR[] = await Promise.all(
      tables.map(async t => ({ ...t, qr: await getQRForTable(t.$id), generating: false }))
    );
    setVenues(p => p.map(v => v.$id === venueId ? { ...v, tables: tablesWithQR, loading: false } : v));
  };

  const handleToggleVenue = (id: string, current: boolean) => {
    startTransition(async () => {
      await toggleVenueActive(id, !current);
      setVenues(p => p.map(v => v.$id === id ? { ...v, is_active: !current } : v));
    });
  };

  const handleDeleteVenue = (id: string) => {
    if (!confirm("Delete this venue and all its tables?")) return;
    startTransition(async () => {
      await deleteVenue(id);
      setVenues(p => p.filter(v => v.$id !== id));
    });
  };

  const handleToggleTable = (venueId: string, tableId: string, current: boolean) => {
    startTransition(async () => {
      await toggleTableActive(tableId, !current);
      setVenues(p => p.map(v =>
        v.$id === venueId
          ? { ...v, tables: v.tables?.map(t => t.$id === tableId ? { ...t, is_active: !current } : t) ?? null }
          : v
      ));
    });
  };

  const handleDeleteTable = (venueId: string, tableId: string) => {
    if (!confirm("Delete this table and its QR code?")) return;
    startTransition(async () => {
      await deleteTableWithQR(tableId);
      setVenues(p => p.map(v =>
        v.$id === venueId ? { ...v, tables: v.tables?.filter(t => t.$id !== tableId) ?? null } : v
      ));
    });
  };

  const handleGenerateQR = async (venueId: string, venueSlug: string, tableId: string, tableNumber: number, regenerate = false) => {
    setVenues(p => p.map(v =>
      v.$id === venueId
        ? { ...v, tables: v.tables?.map(t => t.$id === tableId ? { ...t, generating: true } : t) ?? null }
        : v
    ));
    try {
      const qrDoc   = await generateQRForTable({ tableId, venueSlug, tableNumber, regenerate });
      const dataUrl = await QRCode.toDataURL(qrDoc.resolved_url, { width: 512, margin: 2, color: { dark: "#000000", light: "#ffffff" } });
      const blob    = await (await fetch(dataUrl)).blob();
      const updated = await uploadQRImage(qrDoc.$id, blob, `${qrDoc.slug}.png`);
      setVenues(p => p.map(v =>
        v.$id === venueId
          ? { ...v, tables: v.tables?.map(t => t.$id === tableId ? { ...t, qr: updated, generating: false } : t) ?? null }
          : v
      ));
    } catch (err) {
      console.error("QR generation failed", err);
      setVenues(p => p.map(v =>
        v.$id === venueId
          ? { ...v, tables: v.tables?.map(t => t.$id === tableId ? { ...t, generating: false } : t) ?? null }
          : v
      ));
    }
  };

  const handleDownload = (qr: QRCodeDoc, label: string) => {
    if (!qr.qr_image_url) return;
    const a = document.createElement("a");
    a.href = qr.qr_image_url; a.download = `${label}.png`; a.click();
  };

  if (loading) return <PageLoader />;

  const totalTables = venues.reduce((s, v) => s + (v.tables?.length ?? 0), 0);
  const totalSeats  = venues.reduce((s, v) => s + (v.tables?.reduce((ts, t) => ts + t.seat_count, 0) ?? 0), 0);
  const totalQRs    = venues.reduce((s, v) => s + (v.tables?.filter(t => t.qr?.qr_image_url).length ?? 0), 0);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Management"
        title="Venues & Tables"
        sub="Manage venues, tables and generate QR codes"
        action={
          <PrimaryBtn onClick={() => setShowAdd(true)}>
            <Plus size={13} /> New Venue
          </PrimaryBtn>
        }
      />

      {/* ── Stats ── */}
      <div className="grid grid-cols-4 gap-3 mb-7">
        {[
          { label: "Venues",   value: venues.length, accent: "#c9a84c" },
          { label: "Tables",   value: totalTables,   accent: C.orange  },
          { label: "Seats",    value: totalSeats,    accent: C.teal    },
          { label: "QR Ready", value: totalQRs,      accent: "#9b8fd4" },
        ].map(s => (
          <div
            key={s.label}
            className="rounded-2xl px-5 py-4"
            style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <p className="text-[10px] uppercase tracking-[0.18em] mb-2" style={{ color: C.muted }}>{s.label}</p>
            <p className="text-[32px] font-light leading-none" style={{ color: s.accent, fontFamily: "var(--font-cormorant)" }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {venues.length === 0 && (
        <div className="flex-1 flex items-center justify-center py-16">
          <div className="text-center">
            <p className="text-[13px] mb-4" style={{ color: C.muted }}>No venues yet</p>
            <PrimaryBtn onClick={() => setShowAdd(true)}><Plus size={13} /> Add your first venue</PrimaryBtn>
          </div>
        </div>
      )}

      {/* ── Venue list ── */}
      <div className="flex flex-col gap-2">
        {venues.map(venue => {
          const accent     = THEME_COLORS[venue.slug] ?? THEME_COLORS.restaurant;
          const isExpanded = expandedVenue === venue.$id;

          return (
            <div
              key={venue.$id}
              className="rounded-2xl overflow-hidden transition-all"
              style={{
                background: C.card,
                border: `1px solid ${isExpanded ? `${accent}35` : C.border}`,
                boxShadow: isExpanded ? `0 0 0 1px ${accent}10` : "0 1px 3px rgba(0,0,0,0.04)",
              }}
            >
              {/* ── Venue header row ── */}
              <div
                className="flex items-center gap-4 px-5 py-4 cursor-pointer select-none transition-colors hover:bg-[#F9F8F6]"
                onClick={() => handleExpand(venue.$id)}
              >
                {(venue as any).image_url
                  ? <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${accent}30` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={(venue as any).image_url} alt={venue.name} className="w-full h-full object-cover" />
                    </div>
                  : <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: venue.is_active ? accent : C.border }} />
                }

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span
                      className="text-[14px] font-light"
                      style={{ color: C.text, fontFamily: "var(--font-cormorant)", letterSpacing: "0.04em" }}
                    >
                      {venue.name}
                    </span>
                    <span
                      className="text-[9px] font-mono px-2 py-0.5 rounded-full"
                      style={{ background: C.bg, border: `1px solid ${C.border}`, color: C.muted }}
                    >
                      /{venue.slug}
                    </span>
                    {(venue as any).theme && (
                      <span
                        className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                        style={{ background: `${accent}12`, color: accent, border: `1px solid ${accent}22` }}
                      >
                        {THEME_LABELS[(venue as any).theme] ?? (venue as any).theme}
                      </span>
                    )}
                    {!venue.is_active && <StatusPill label="Inactive" color="red" />}
                  </div>
                  {venue.description && (
                    <p className="text-[11px] mt-0.5 truncate" style={{ color: C.muted }}>{venue.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <button
                    onClick={() => handleToggleVenue(venue.$id, venue.is_active)}
                    disabled={isPending}
                    className="cursor-pointer p-1.5 rounded-lg transition-colors hover:bg-[#F4F2EE]"
                    style={{ color: venue.is_active ? C.green : C.muted }}
                  >
                    {venue.is_active ? <ToggleRight size={17} /> : <ToggleLeft size={17} />}
                  </button>
                  <button
                    onClick={() => handleDeleteVenue(venue.$id)}
                    disabled={isPending}
                    className="cursor-pointer p-1.5 rounded-lg transition-colors"
                    style={{ color: C.muted }}
                    onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                    onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>

                <span style={{ color: C.muted }}>
                  {venue.loading
                    ? <Loader2 size={13} className="animate-spin" />
                    : isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                </span>
              </div>

              {/* ── Tables panel ── */}
              {isExpanded && venue.tables !== null && (
                <div className="px-5 py-4" style={{ borderTop: `1px solid ${accent}18` }}>
                  <div className="flex items-center justify-between mb-3">
                    <SectionLabel
                      label={`${venue.tables.length} ${venue.tables.length === 1 ? "Table" : "Tables"}${venue.tables.length > 0 ? ` · ${venue.tables.reduce((s, t) => s + t.seat_count, 0)} seats` : ""}`}
                    />
                    <button
                      onClick={() => setShowTable(venue.$id)}
                      className="flex items-center gap-1 text-[11px] cursor-pointer transition-colors"
                      style={{ color: C.muted }}
                      onMouseEnter={e => (e.currentTarget.style.color = accent)}
                      onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                    >
                      <Plus size={11} /> Add Table
                    </button>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {venue.tables.map(table => {
                      const hasQR = !!table.qr?.qr_image_url;
                      const qrCoverage = hasQR ? 100 : 0;
                      return (
                        <div
                          key={table.$id}
                          className="flex items-center gap-3.5 rounded-xl px-4 py-2.5 transition-all"
                          style={{ background: C.bg, border: `1px solid ${C.border}` }}
                        >
                          {/* Table number badge */}
                          <div
                            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${accent}10`, border: `1px solid ${accent}20` }}
                          >
                            <span className="text-[11px] font-mono font-semibold" style={{ color: accent }}>
                              {table.table_number}
                            </span>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[12px] font-medium" style={{ color: C.text }}>
                                Table {table.table_number}
                              </span>
                              <span className="text-[10px]" style={{ color: C.muted }}>{table.seat_count} seats</span>
                              {!table.is_active && <StatusPill label="Inactive" color="red" />}
                              {hasQR && (
                                <span className="flex items-center gap-1 text-[10px]" style={{ color: C.green }}>
                                  <CheckCircle2 size={8} /> Ready
                                </span>
                              )}
                            </div>
                          </div>

                          {/* QR ring progress */}
                          <Ring pct={qrCoverage} size={34} accent={hasQR ? C.green : C.border}>
                            <QrCode size={10} strokeWidth={1.5} color={hasQR ? C.green : C.muted} />
                          </Ring>

                          {/* QR thumbnail */}
                          {hasQR && table.qr?.qr_image_url && (
                            <div
                              className="w-8 h-8 rounded-lg overflow-hidden bg-white flex-shrink-0 cursor-pointer hover:scale-110 transition-transform"
                              style={{ border: `1px solid ${accent}30` }}
                              onClick={() => { setQrSrc(table.qr!.qr_image_url); setShowQR(true); }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={table.qr.qr_image_url} alt="QR" className="w-full h-full object-cover" />
                            </div>
                          )}

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <AccentBtn
                              small
                              onClick={() => handleGenerateQR(venue.$id, venue.slug, table.$id, table.table_number, hasQR)}
                              disabled={table.generating || isPending}
                              accent={accent}
                            >
                              {table.generating
                                ? <><Loader2 size={10} className="animate-spin" /> Generating…</>
                                : hasQR
                                  ? <><RefreshCw size={10} /> Regen</>
                                  : <><QrCode size={10} /> Generate QR</>}
                            </AccentBtn>

                            {hasQR && table.qr && (
                              <button
                                onClick={() => handleDownload(table.qr!, `${venue.slug}-t${table.table_number}`)}
                                className="p-1.5 rounded-xl transition-all cursor-pointer"
                                style={{ border: `1px solid ${C.border}`, color: C.muted }}
                                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = C.text; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = C.muted; }}
                              >
                                <Download size={12} />
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleTable(venue.$id, table.$id, table.is_active)}
                              disabled={isPending}
                              className="cursor-pointer p-1.5 rounded-xl transition-colors"
                              style={{ color: table.is_active ? C.green : C.muted }}
                            >
                              {table.is_active ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
                            </button>

                            <button
                              onClick={() => handleDeleteTable(venue.$id, table.$id)}
                              disabled={isPending}
                              className="cursor-pointer p-1.5 rounded-xl transition-colors"
                              style={{ color: C.muted }}
                              onMouseEnter={e => (e.currentTarget.style.color = C.red)}
                              onMouseLeave={e => (e.currentTarget.style.color = C.muted)}
                            >
                              <Trash2 size={11} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {venue.tables.length === 0 && (
                      <p className="text-[12px] italic py-2" style={{ color: C.sub }}>No tables yet — add one above.</p>
                    )}
                  </div>

                  {showAddTable === venue.$id && (
                    <AddTableForm
                      accent={accent}
                      onClose={() => setShowTable(null)}
                      onAdd={async (tableNumber, seatCount) => {
                        const table = await createTable({ venue_id: venue.$id, table_number: tableNumber, seat_count: seatCount });
                        setVenues(p => p.map(v =>
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
          onAdd={async data => {
            const { venue } = await createVenue(data);
            setVenues(p => [...p, { ...venue, tables: [], loading: false }]);
            setShowAdd(false);
          }}
        />
      )}

      {showQR && qrSrc && (
        <QRModal src={qrSrc} onClose={() => { setShowQR(false); setQrSrc(null); }} />
      )}
    </PageShell>
  );
}

/* ─── Add Table Form ─────────────────────────────────── */
function AddTableForm({ accent, onClose, onAdd }: {
  accent: string; onClose: () => void; onAdd: (n: number, s: number) => Promise<void>;
}) {
  const [tableNumber, setTN] = useState("");
  const [seatCount, setSC]   = useState("");
  const [saving, setSaving]  = useState(false);

  return (
    <div
      className="mt-3 flex items-end gap-3 rounded-2xl px-5 py-4"
      style={{ background: C.bg, border: `1px solid ${accent}20` }}
    >
      {[
        { label: "Table no.", value: tableNumber, set: setTN, ph: "5" },
        { label: "Seats",     value: seatCount,   set: setSC, ph: "4" },
      ].map(f => (
        <div key={f.label} className="flex flex-col gap-1.5">
          <label className="text-[9px] uppercase tracking-widest" style={{ color: C.muted }}>{f.label}</label>
          <input
            type="number" value={f.value}
            onChange={e => f.set(e.target.value)}
            placeholder={f.ph}
            className={`w-20 ${inputCls}`}
          />
        </div>
      ))}
      <AccentBtn
        small accent={accent}
        onClick={async () => { if (!tableNumber || !seatCount) return; setSaving(true); await onAdd(parseInt(tableNumber), parseInt(seatCount)); setSaving(false); }}
        disabled={saving || !tableNumber || !seatCount}
      >
        {saving && <Loader2 size={10} className="animate-spin" />} Add
      </AccentBtn>
      <button onClick={onClose} className="text-[12px] cursor-pointer transition-colors px-2" style={{ color: C.muted }}>
        Cancel
      </button>
    </div>
  );
}

/* ─── Add Venue Modal ────────────────────────────────── */
function AddVenueModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: { name: string; slug: string; description: string; theme: string; image_url?: string }) => Promise<void>;
}) {
  const [name, setName]         = useState("");
  const [slug, setSlug]         = useState("");
  const [desc, setDesc]         = useState("");
  const [theme, setTheme]       = useState("restaurant");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving]     = useState(false);
  const accent = THEME_COLORS[theme] ?? "#c9a84c";

  return (
    <Modal onClose={onClose} width="440px">
      <h2
        className="text-[20px] font-light mb-0.5"
        style={{ color: C.text, fontFamily: "var(--font-cormorant)", letterSpacing: "0.03em" }}
      >
        New Venue
      </h2>
      <p className="text-[11px] mb-5" style={{ color: C.muted }}>Configure your venue details below</p>

      <div className="flex flex-col gap-3.5">
        {[
          {
            label: "Venue name", value: name,
            onChange: (v: string) => { setName(v); setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")); },
            ph: "e.g. Garden Area",
          },
          { label: "Slug (URL key)", value: slug, onChange: setSlug, ph: "e.g. garden" },
          { label: "Description",   value: desc, onChange: setDesc, ph: "e.g. Outdoor garden seating" },
        ].map(f => (
          <div key={f.label} className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>{f.label}</label>
            <input value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.ph} className={inputCls} />
          </div>
        ))}

        {/* Image URL */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest flex items-center gap-1.5" style={{ color: C.muted }}>
            <ImageIcon size={9} /> Cover image URL
            <span className="normal-case tracking-normal ml-1 text-[9px]" style={{ color: C.sub }}>(optional)</span>
          </label>
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)} placeholder="https://…" className={inputCls} />
          {imageUrl && (
            <div className="h-20 rounded-xl overflow-hidden mt-1" style={{ border: `1px solid ${accent}25` }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
            </div>
          )}
        </div>

        {/* Theme */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] uppercase tracking-widest" style={{ color: C.muted }}>Theme</label>
          <select value={theme} onChange={e => setTheme(e.target.value)} className={inputCls}>
            <option value="restaurant">Restaurant</option>
            <option value="pool">Pool</option>
            <option value="lobby">Lobby Café</option>
            <option value="event">Event Space</option>
          </select>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <AccentBtn
          accent={accent}
          onClick={async () => {
            if (!name || !slug) return;
            setSaving(true);
            await onAdd({ name, slug, description: desc, theme, ...(imageUrl ? { image_url: imageUrl } : {}) });
            setSaving(false);
          }}
          disabled={saving || !name || !slug}
        >
          {saving && <Loader2 size={12} className="animate-spin" />}
          Create Venue
        </AccentBtn>
        <button onClick={onClose} className="px-4 text-[13px] cursor-pointer transition-colors" style={{ color: C.muted }}>
          Cancel
        </button>
      </div>
    </Modal>
  );
}