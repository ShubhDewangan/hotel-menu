"use client";

import { useState } from "react";
import {
  Building2, UtensilsCrossed, CalendarDays, QrCode,
  TrendingUp, ChefHat, Flame, Plus, Minus,
  AlertTriangle, Info, CheckCircle2, Zap,
} from "lucide-react";

// ─── Design tokens ───────────────────────────────────────
const C = {
  bg:       "#f5f2ec",
  card:     "#ffffff",
  border:   "#e8e3da",
  text:     "#141414",
  muted:    "#6b6b6b",
  sub:      "#9e9e9e",
  gold:     "linear-gradient(135deg,#c9a84c 0%,#e8c96a 50%,#c9a84c 100%)",
  goldSolid:"#c9a84c",
  goldText: "rgba(61,38,0,0.72)",
  orange:   "#d4520e",
  orangeBg: "rgba(212,82,14,0.08)",
  orangeBd: "rgba(212,82,14,0.25)",
  green:    "#1d6b4e",
  greenBg:  "rgba(29,107,78,0.08)",
  greenBd:  "rgba(29,107,78,0.22)",
  red:      "#b33030",
  redBg:    "rgba(179,48,48,0.08)",
  violetBg: "rgba(109,40,217,0.07)",
  violetBd: "rgba(109,40,217,0.20)",
  tealBg:   "rgba(61,214,163,0.10)",
  tealBd:   "rgba(61,214,163,0.30)",
  teal:     "#0f6e56",
};

const CORMORANT = "'Cormorant Garamond', Georgia, serif";

// ─── Types ────────────────────────────────────────────────
type Tier = "chefs_choice" | "top_pick" | "popular" | "normal";
type AlertType = "error" | "warning" | "info";

interface DashStats {
  qrCoverage: number;
  qrReady: number;
  tableCount: number;
  venueCount: number;
  upcomingEvents: number;
  liveEvents: number;
  activeMenus: number;
  totalMenuItems: number;
}

interface VenueRow {
  $id: string;
  name: string;
  theme: "restaurant" | "pool" | "lobby" | "event";
  image_url?: string;
  is_active: boolean;
  opening_hours?: string; // JSON: { open: "HH:MM", close: "HH:MM" }
  tableCount: number;
  qrCoverage: number;
  scanCountWeek: number;
  lastScan?: string; // ISO date string
}

interface MenuItem {
  $id: string;
  name: string;
  category: string;
  price: number;
  image_url?: string;
  is_available: boolean;
  popularity_points: number;
  tier: Tier;
  venue_name?: string;
}

interface ScanDay {
  date: string;
  count: number;
}

interface DashAlert {
  type: AlertType;
  message: string;
}

// ─── Hardcoded mock data ──────────────────────────────────
const STATS: DashStats = {
  qrCoverage:    83,
  qrReady:       58,
  tableCount:    70,
  venueCount:    6,
  upcomingEvents:3,
  liveEvents:    1,
  activeMenus:   4,
  totalMenuItems:87,
};

const VENUES: VenueRow[] = [
  {
    $id: "v1", name: "Hall A", theme: "restaurant",
    is_active: true, opening_hours: '{"open":"09:00","close":"23:00"}',
    tableCount: 18, qrCoverage: 100, scanCountWeek: 310,
    lastScan: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    $id: "v2", name: "Lawn", theme: "event",
    is_active: true, opening_hours: '{"open":"10:00","close":"22:00"}',
    tableCount: 15, qrCoverage: 87, scanCountWeek: 198,
    lastScan: new Date(Date.now() - 5 * 60000).toISOString(),
  },
  {
    $id: "v3", name: "Lounge", theme: "pool",
    is_active: true, opening_hours: '{"open":"12:00","close":"02:00"}',
    tableCount: 10, qrCoverage: 75, scanCountWeek: 142,
    lastScan: new Date(Date.now() - 12 * 60000).toISOString(),
  },
  {
    $id: "v4", name: "Terrace", theme: "lobby",
    is_active: false,
    tableCount: 12, qrCoverage: 60, scanCountWeek: 44,
    lastScan: new Date(Date.now() - 70 * 60000).toISOString(),
  },
  {
    $id: "v5", name: "Stage Area", theme: "event",
    is_active: false,
    tableCount: 8,  qrCoverage: 40, scanCountWeek: 12,
    lastScan: new Date(Date.now() - 3 * 24 * 60 * 60000).toISOString(),
  },
  {
    $id: "v6", name: "Poolside Bar", theme: "pool",
    is_active: true, opening_hours: '{"open":"08:00","close":"20:00"}',
    tableCount: 7,  qrCoverage: 100, scanCountWeek: 88,
    lastScan: new Date(Date.now() - 18 * 60000).toISOString(),
  },
];

const MENU_ITEMS: MenuItem[] = [
  { $id: "m1",  name: "Butter Chicken",    category: "Main Course", price: 420, is_available: true,  popularity_points: 24, tier: "chefs_choice", venue_name: "Hall A" },
  { $id: "m2",  name: "Paneer Tikka",      category: "Starter",     price: 280, is_available: true,  popularity_points: 18, tier: "top_pick",     venue_name: "Lawn" },
  { $id: "m3",  name: "Dal Makhani",       category: "Main Course", price: 240, is_available: true,  popularity_points: 14, tier: "top_pick",     venue_name: "Hall A" },
  { $id: "m4",  name: "Gulab Jamun",       category: "Dessert",     price: 120, is_available: true,  popularity_points:  8, tier: "popular",      venue_name: "Hall A" },
  { $id: "m5",  name: "Mango Lassi",       category: "Beverages",   price:  90, is_available: true,  popularity_points:  7, tier: "popular",      venue_name: "Lounge" },
  { $id: "m6",  name: "Chicken Biryani",   category: "Main Course", price: 380, is_available: true,  popularity_points:  3, tier: "normal",       venue_name: "Lawn" },
  { $id: "m7",  name: "Tandoori Roti",     category: "Bread",       price:  40, is_available: true,  popularity_points:  2, tier: "normal",       venue_name: "Hall A" },
  { $id: "m8",  name: "Veg Manchurian",    category: "Starter",     price: 210, is_available: false, popularity_points:  0, tier: "normal",       venue_name: "Terrace" },
  { $id: "m9",  name: "Fish Tikka",        category: "Starter",     price: 360, is_available: true,  popularity_points: 22, tier: "chefs_choice", venue_name: "Lounge" },
  { $id: "m10", name: "Choco Lava Cake",   category: "Dessert",     price: 180, is_available: true,  popularity_points: 11, tier: "top_pick",     venue_name: "Lounge" },
];

const SCAN_DAYS: ScanDay[] = [
  { date: "Mon", count: 40  },
  { date: "Tue", count: 95  },
  { date: "Wed", count: 120 },
  { date: "Thu", count: 88  },
  { date: "Fri", count: 160 },
  { date: "Sat", count: 210 },
  { date: "Sun", count: 247 },
];

const ALERTS: DashAlert[] = [
  { type: "warning", message: "Terrace: 4 QR codes expired (> 30 days old)." },
  { type: "warning", message: "Stage Area: Menu not assigned to any table." },
  { type: "info",    message: "Poolside Bar menu updated 2 hours ago." },
];

// ─── Helpers ──────────────────────────────────────────────
const THEME_ACCENT: Record<string, string> = {
  restaurant: "#c9a84c",
  pool:       "#3dd6a3",
  lobby:      "#9b8fd4",
  event:      "#e07d9a",
};

function getTier(pts: number): Tier {
  if (pts >= 20) return "chefs_choice";
  if (pts >= 10) return "top_pick";
  if (pts >= 5)  return "popular";
  return "normal";
}

function relativeTime(isoStr?: string): string {
  if (!isoStr) return "Never";
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 60000);
  if (diff < 60)   return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function isVenueOpen(opening_hours?: string): boolean | null {
  if (!opening_hours) return null;
  try {
    const { open, close } = JSON.parse(opening_hours) as { open: string; close: string };
    const now = new Date();
    const [oh, om] = open.split(":").map(Number);
    const [ch, cm] = close.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    return mins >= oh * 60 + om && mins < ch * 60 + cm;
  } catch { return null; }
}

// ─── Mini components ──────────────────────────────────────
function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-2">
      <span className="text-[10px] uppercase tracking-[0.18em] font-semibold" style={{ color: C.muted }}>{label}</span>
      {sub && <span className="text-[11px]" style={{ color: C.sub }}>{sub}</span>}
    </div>
  );
}

function StatusPill({ label, color }: { label: string; color: "green" | "red" | "teal" | "orange" }) {
  const map = {
    green:  { bg: C.greenBg,  bd: C.greenBd,  tx: C.green  },
    red:    { bg: C.redBg,    bd: "rgba(179,48,48,0.22)", tx: C.red },
    teal:   { bg: C.tealBg,   bd: C.tealBd,   tx: C.teal   },
    orange: { bg: C.orangeBg, bd: C.orangeBd, tx: C.orange  },
  };
  const s = map[color];
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
      style={{ background: s.bg, border: `1px solid ${s.bd}`, color: s.tx }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.tx }} />
      {label}
    </span>
  );
}

function GoldPill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: "linear-gradient(90deg,#c9a84c,#e8c96a)", color: "#3d2600" }}>
      <Icon size={9} strokeWidth={2.5} />{label}
    </span>
  );
}

function OrangePill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: C.orangeBg, border: `1px solid ${C.orangeBd}`, color: C.orange }}>
      <Icon size={9} strokeWidth={2.5} />{label}
    </span>
  );
}

function Sparkline({ data, accent }: { data: number[]; accent: string }) {
  const max = Math.max(...data, 1);
  const w = 80, h = 28;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - (v / max) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} className="mt-1.5">
      <polyline points={pts} fill="none" stroke={accent} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function Ring({ pct, size, accent, children }: { pct: number; size: number; accent: string; children: React.ReactNode }) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={C.border} strokeWidth={3} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={accent} strokeWidth={3}
          strokeDasharray={`${dash} ${circ - dash}`} strokeLinecap="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}

// ─── Points control ───────────────────────────────────────
function PointsControl({ item, onUpdate }: { item: MenuItem; onUpdate: (id: string, pts: number) => void }) {
  const [pts, setPts] = useState(item.popularity_points);
  const [busy, setBusy] = useState(false);

  const adjust = async (delta: 1 | -1) => {
    if (busy) return;
    setBusy(true);
    // Simulated async update — replace with real action when not hardcoded
    await new Promise<void>(r => setTimeout(r, 200));
    const next = Math.max(0, pts + delta);
    setPts(next);
    onUpdate(item.$id, next);
    setBusy(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => adjust(-1)} disabled={busy || pts === 0}
        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30 transition-all hover:scale-110"
        style={{ border: `1px solid ${C.border}`, background: C.card }}>
        <Minus size={9} strokeWidth={2.5} color={C.text} />
      </button>
      <span className="w-5 text-center text-[12px] font-semibold tabular-nums"
        style={{ color: pts > 0 ? C.orange : C.muted }}>{pts}</span>
      <button onClick={() => adjust(1)} disabled={busy}
        className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all hover:scale-110"
        style={{ background: C.text, color: "#fff" }}>
        <Plus size={9} strokeWidth={2.5} />
      </button>
    </div>
  );
}

// ─── Alerts card ─────────────────────────────────────────
function AlertsCard({ alerts }: { alerts: DashAlert[] }) {
  const hasIssues = alerts.some(a => a.type !== "info");
  const color = alerts.length === 0 ? "green" : hasIssues ? "orange" : "violet";
  const styles = {
    green:  { bg: C.greenBg,  bd: C.greenBd,  tx: C.green,        Icon: CheckCircle2 },
    orange: { bg: C.orangeBg, bd: C.orangeBd, tx: C.orange,       Icon: AlertTriangle },
    violet: { bg: C.violetBg, bd: C.violetBd, tx: "#6d28d9",      Icon: Info },
  } as const;
  const s = styles[color];
  const IconComp = s.Icon;

  return (
    <div className="rounded-2xl p-5 flex flex-col gap-3"
      style={{ background: s.bg, border: `1px solid ${s.bd}`, minHeight: "112px" }}>
      <div className="flex items-center gap-2">
        <IconComp size={13} color={s.tx} strokeWidth={2} />
        <p className="text-[12px] font-semibold" style={{ color: s.tx }}>
          {alerts.length === 0 ? "All systems healthy" : `${alerts.length} notice${alerts.length > 1 ? "s" : ""}`}
        </p>
      </div>
      <div className="flex flex-col gap-1.5 overflow-y-auto max-h-[72px]">
        {alerts.map((a, i) => (
          <div key={i} className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
              style={{ background: a.type === "error" ? C.red : a.type === "warning" ? C.orange : "#6d28d9" }} />
            <span className="text-[11px] leading-snug" style={{ color: s.tx }}>{a.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent }: {
  label: string; value: number; icon: React.ElementType; accent: string;
}) {
  return (
    <div className="rounded-2xl p-5 flex flex-col justify-between"
      style={{ background: C.card, border: `1px solid ${C.border}`, minHeight: "140px" }}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>{label}</p>
        <Icon size={14} strokeWidth={1.5} color={accent} />
      </div>
      <p className="text-[42px] font-light leading-none" style={{ color: C.text, fontFamily: CORMORANT }}>{value}</p>
    </div>
  );
}

// ─── Venue strip ──────────────────────────────────────────
function VenueStrip({ v }: { v: VenueRow }) {
  const accent = THEME_ACCENT[v.theme] ?? "#c9a84c";
  const open = isVenueOpen(v.opening_hours);

  return (
    <div className="flex items-center gap-5 rounded-2xl px-5 py-3.5 transition-all hover:border-[#D8D3C8]"
      style={{ background: C.card, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>

      {v.image_url
        ? <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0" style={{ border: `1px solid ${accent}30` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
          </div>
        : <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ background: v.is_active ? accent : C.border }} />
      }

      <span className="text-[14px] font-light flex-1 truncate"
        style={{ color: C.text, fontFamily: CORMORANT, letterSpacing: "0.03em" }}>
        {v.name}
      </span>

      <div className="flex items-center gap-6 flex-shrink-0">
        <Ring pct={v.qrCoverage} size={44} accent={accent}>
          <span className="text-[9px] font-semibold" style={{ color: C.text }}>{v.qrCoverage}%</span>
        </Ring>

        <div className="text-center">
          <p className="text-[20px] font-light leading-none" style={{ color: C.text, fontFamily: CORMORANT }}>{v.tableCount}</p>
          <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: C.sub }}>Tables</p>
        </div>

        <div className="text-center">
          <p className="text-[20px] font-light leading-none" style={{ color: accent, fontFamily: CORMORANT }}>{v.scanCountWeek}</p>
          <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: C.sub }}>Scans/wk</p>
        </div>

        <div className="text-center">
          <p className="text-[12px]" style={{ color: C.muted }}>{relativeTime(v.lastScan)}</p>
          <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: C.sub }}>Last scan</p>
        </div>

        <div className="flex items-center gap-2">
          {open !== null && <StatusPill label={open ? "Open" : "Closed"} color={open ? "green" : "red"} />}
          <StatusPill label={v.is_active ? "Live" : "Off"} color={v.is_active ? "teal" : "red"} />
        </div>
      </div>
    </div>
  );
}

// ─── Menu item card ───────────────────────────────────────
function MenuItemCard({ item, onUpdate }: { item: MenuItem; onUpdate: (id: string, pts: number) => void }) {
  const [pts, setPts] = useState(item.popularity_points);
  const tier = getTier(pts);

  const handle = (id: string, p: number) => { setPts(p); onUpdate(id, p); };

  const badge = tier === "chefs_choice" ? <GoldPill   label="Chef's Choice" Icon={ChefHat} />
              : tier === "top_pick"     ? <OrangePill  label="Top Pick"      Icon={Flame}   />
              : tier === "popular"      ? <StatusPill  label="Popular"       color="teal"   />
              : null;

  return (
    <div className="rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-md"
      style={{
        background: C.card,
        border: `1px solid ${tier === "chefs_choice" ? "#c9a84c44" : tier === "top_pick" ? C.orangeBd : C.border}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}>
      <div className="relative h-[108px] flex-shrink-0" style={{ background: "#f0ede7" }}>
        {item.image_url
          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center">
              <UtensilsCrossed size={22} strokeWidth={1} color="#d1cdc7" />
            </div>
        }
        {badge && <div className="absolute top-2 left-2">{badge}</div>}
        <span className="absolute top-2 right-2 w-2 h-2 rounded-full block"
          style={{ background: item.is_available ? "#22c55e" : "#d1cdc7",
            boxShadow: item.is_available ? "0 0 0 3px rgba(34,197,94,0.2)" : "none" }} />
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-[13px] font-medium truncate leading-tight" style={{ color: C.text }}>{item.name}</p>
          <p className="text-[10px] mt-0.5 truncate" style={{ color: C.muted }}>
            {item.category}{item.venue_name ? ` · ${item.venue_name}` : ""}
          </p>
        </div>
        <div className="flex items-center justify-between mt-auto pt-1.5" style={{ borderTop: `1px solid ${C.border}` }}>
          <span className="text-[13px] font-semibold" style={{ color: C.text }}>₹{item.price}</span>
          <PointsControl item={{ ...item, popularity_points: pts }} onUpdate={handle} />
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function AdminDashboard() {
  const [items, setItems] = useState<MenuItem[]>(MENU_ITEMS);

  const handlePtsUpdate = (id: string, pts: number) => {
    setItems(prev => prev.map(i => i.$id === id ? { ...i, popularity_points: pts, tier: getTier(pts) } : i));
  };

  const totalScansWeek = VENUES.reduce((s, v) => s + v.scanCountWeek, 0);
  const tierOrder: Record<Tier, number> = { chefs_choice: 0, top_pick: 1, popular: 2, normal: 3 };
  const sortedItems = [...items].sort((a, b) =>
    tierOrder[a.tier] - tierOrder[b.tier] || b.popularity_points - a.popularity_points
  );

  return (
    <div className="max-h-screen overflow-y-auto custom-scrollbar m-3 w-screen rounded-2xl p-6 md:p-8" style={{ background: C.bg, fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-screen mx-auto">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: C.muted }}>Admin</p>
            <h1 className="text-[32px] font-light leading-none" style={{ fontFamily: CORMORANT, color: C.text }}>
              Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[11px]" style={{ color: C.muted }}>Live</span>
          </div>
        </div>

        {/* ── Row 1: QR gold + 3 stat cards ── */}
        <div className="grid gap-3 mb-3" style={{ gridTemplateColumns: "2.2fr 1fr 1fr 1fr" }}>

          {/* Gold QR coverage card */}
          <div className="rounded-2xl p-6 flex flex-col justify-between"
            style={{ background: C.gold, minHeight: "140px" }}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold mb-1" style={{ color: C.goldText }}>
                  QR Coverage
                </p>
                <p className="text-[52px] font-light leading-none text-black" style={{ fontFamily: CORMORANT }}>
                  {STATS.qrCoverage}<span className="text-[26px]">%</span>
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(0,0,0,0.1)" }}>
                <QrCode size={18} strokeWidth={1.5} color="#111" />
              </div>
            </div>
            <div>
              <div className="h-1.5 rounded-full mb-1.5" style={{ background: "rgba(0,0,0,0.12)" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${STATS.qrCoverage}%`, background: "rgba(0,0,0,0.32)" }} />
              </div>
              <p className="text-[10px] font-medium" style={{ color: C.goldText }}>
                {STATS.qrReady} of {STATS.tableCount} tables ready
              </p>
            </div>
          </div>

          <StatCard label="Venues"   value={STATS.venueCount}  icon={Building2}       accent="#c9a84c" />
          <StatCard label="Tables"   value={STATS.tableCount}  icon={UtensilsCrossed} accent={C.orange} />

          {/* Scans/week — black border */}
          <div className="rounded-2xl p-5 flex flex-col justify-between"
            style={{ background: C.card, border: `2px solid ${C.text}`, minHeight: "140px" }}>
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>Scans / week</p>
              <Zap size={14} strokeWidth={2} color={C.text} />
            </div>
            <div>
              <p className="text-[38px] font-light leading-none" style={{ color: C.text, fontFamily: CORMORANT }}>
                {totalScansWeek}
              </p>
              <Sparkline data={SCAN_DAYS.map(d => d.count)} accent={C.orange} />
            </div>
          </div>
        </div>

        {/* ── Row 2: events, menus, alerts ── */}
        <div className="grid gap-3 mb-4" style={{ gridTemplateColumns: "1fr 1fr 1.6fr" }}>

          {/* Events */}
          <div className="rounded-2xl p-5 flex flex-col justify-between"
            style={{ background: C.card, border: `2px solid ${C.text}`, minHeight: "112px" }}>
            <CalendarDays size={15} strokeWidth={1.5} color={C.text} />
            <div>
              <p className="text-[36px] font-light leading-none" style={{ color: C.text, fontFamily: CORMORANT }}>
                {STATS.upcomingEvents}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: C.muted }}>Upcoming events</p>
              {STATS.liveEvents > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-[10px]" style={{ color: C.green }}>{STATS.liveEvents} live now</span>
                </div>
              )}
            </div>
          </div>

          {/* Menus */}
          <div className="rounded-2xl p-5 flex flex-col justify-between"
            style={{ background: C.card, border: `2px solid ${C.text}`, minHeight: "112px" }}>
            <UtensilsCrossed size={15} strokeWidth={1.5} color={C.text} />
            <div>
              <p className="text-[36px] font-light leading-none" style={{ color: C.text, fontFamily: CORMORANT }}>
                {STATS.activeMenus}
              </p>
              <p className="text-[10px] uppercase tracking-[0.18em] mt-0.5" style={{ color: C.muted }}>Active menus</p>
              <p className="text-[10px] mt-0.5" style={{ color: C.sub }}>{STATS.totalMenuItems} total items</p>
            </div>
          </div>

          <AlertsCard alerts={ALERTS} />
        </div>

        {/* ── Venue strips ── */}
        <div className="mb-4">
          <SectionLabel label="Venue status" />
          <div className="flex flex-col gap-2">
            {VENUES.map(v => <VenueStrip key={v.$id} v={v} />)}
          </div>
        </div>

        {/* ── Popularity grid ── */}
        <div>
          <SectionLabel label="Menu popularity" sub="Adjust points → tier badges show on guest menu" />
          {sortedItems.length === 0 ? (
            <div className="rounded-2xl p-8 flex flex-col items-center gap-3 text-center"
              style={{ border: `2px dashed ${C.border}` }}>
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: C.bg }}>
                <ChefHat size={20} strokeWidth={1.5} color={C.muted} />
              </div>
              <p className="text-[13px] max-w-[260px]" style={{ color: C.muted }}>
                No menu items yet. Add items in the Menu Editor, then adjust points here.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <GoldPill   label="20+ pts = Chef's Choice" Icon={ChefHat} />
                <OrangePill label="10–19 = Top Pick"        Icon={Flame}   />
                <StatusPill label="5–9 = Popular"           color="teal"   />
              </div>
            </div>
          ) : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
              {sortedItems.map(item => (
                <MenuItemCard key={item.$id} item={item} onUpdate={handlePtsUpdate} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}