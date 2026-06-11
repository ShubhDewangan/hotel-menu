/* ═══════════════════════════════════════════════════════
   KASOORI ADMIN — SHARED CONTENT AREA TOKENS + COMPONENTS
   Import these into each content page.
═══════════════════════════════════════════════════════ */

/* ─── Content area tokens ────────────────────────────── */
export const C = {
  bg:        "#F4F2EE",
  card:      "#FFFFFF",
  border:    "#E6E1D8",
  borderMd:  "#D8D3C8",
  text:      "#1a1a18",
  muted:     "#8c8880",
  sub:       "#b8b4ac",
  gold:      "linear-gradient(135deg,#b8922e 0%,#e8ca6a 42%,#f5e080 55%,#c9a84c 100%)",
  goldText:  "#6b4e10",
  orange:    "#E8610A",
  orangeBg:  "#fff3ec",
  orangeBd:  "#f5c5a3",
  teal:      "#3dd6a3",
  tealBg:    "#f0fdf8",
  tealBd:    "#a7f3d8",
  violet:    "#9b8fd4",
  violetBg:  "#f5f3ff",
  violetBd:  "#ddd6fe",
  green:     "#16a34a",
  greenBg:   "#f0faf4",
  greenBd:   "#bbf7d0",
  red:       "#dc2626",
  redBg:     "#fef2f2",
  redBd:     "#fecaca",
} as const;

/* ─── Shared input style ─────────────────────────────── */
export const inputCls = [
  "w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all",
  "bg-[#F4F2EE] border border-[#E6E1D8] text-[#1a1a18]",
  "placeholder-[#b8b4ac]",
  "focus:border-[rgba(201,168,76,0.45)] focus:bg-white",
].join(" ");

/* ─── Page shell ─────────────────────────────────────── */
export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex-1 max-h-screen overflow-hidden my-4 mr-4 rounded-[1.75rem] p-7"
      style={{ background: C.bg, border: `1px solid ${C.border}` }}
    >
      {children}
    </div>
  );
}

/* ─── Page header ────────────────────────────────────── */
export function PageHeader({
  eyebrow, title, sub, action,
}: {
  eyebrow: string; title: string; sub?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-7">
      <div>
        <p className="text-[10px] uppercase tracking-[0.22em] mb-1" style={{ color: C.muted }}>{eyebrow}</p>
        <h1
          className="text-[26px] font-light leading-tight"
          style={{ color: C.text, fontFamily: "var(--font-cormorant)", letterSpacing: "0.01em" }}
        >
          {title}
        </h1>
        {sub && <p className="text-[12px] mt-0.5" style={{ color: C.muted }}>{sub}</p>}
      </div>
      {action}
    </div>
  );
}

/* ─── Stat card — matches reference image style ──────── */
export function StatCard({
  label, value, sub, accent, icon: Icon, wide,
}: {
  label: string; value: string | number; sub?: string;
  accent?: string; icon?: React.ElementType; wide?: boolean;
}) {
  const ac = accent ?? C.muted;
  return (
    <div
      className={`rounded-2xl p-5 flex flex-col justify-between ${wide ? "col-span-2" : ""}`}
      style={{
        background: C.card,
        border: `1px solid ${C.border}`,
        minHeight: "112px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between">
        <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: C.muted }}>{label}</p>
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: `${ac}12`, border: `1px solid ${ac}20` }}
          >
            <Icon size={13} strokeWidth={1.8} style={{ color: ac }} />
          </div>
        )}
      </div>
      <div>
        <p
          className="text-[36px] font-light leading-none mt-2"
          style={{ color: accent ?? C.text, fontFamily: "var(--font-cormorant)" }}
        >
          {value}
        </p>
        {sub && <p className="text-[10px] mt-1" style={{ color: C.sub }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Section label ──────────────────────────────────── */
export function SectionLabel({ label, sub }: { label: string; sub?: string }) {
  return (
    <div className="flex items-baseline gap-3 mb-3">
      <p className="text-[10px] uppercase tracking-[0.2em] font-medium" style={{ color: C.muted }}>{label}</p>
      {sub && <p className="text-[10px]" style={{ color: C.sub }}>{sub}</p>}
    </div>
  );
}

/* ─── Primary button (black) ─────────────────────────── */
export function PrimaryBtn({
  onClick, children, disabled, small,
}: {
  onClick?: () => void; children: React.ReactNode; disabled?: boolean; small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-xl font-medium cursor-pointer disabled:opacity-35 transition-all hover:opacity-85 ${small ? "px-3 py-1.5 text-[11px]" : "px-4 py-2.5 text-[12px]"}`}
      style={{ background: C.text, color: "#fff" }}
    >
      {children}
    </button>
  );
}

/* ─── Accent button ──────────────────────────────────── */
export function AccentBtn({
  onClick, children, disabled, small, accent,
}: {
  onClick?: () => void; children: React.ReactNode; disabled?: boolean; small?: boolean; accent?: string;
}) {
  const ac = accent ?? "#c9a84c";
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-1.5 rounded-xl cursor-pointer disabled:opacity-35 transition-all hover:brightness-105 ${small ? "px-3 py-1.5 text-[11px]" : "px-4 py-2.5 text-[12px]"}`}
      style={{ background: `${ac}14`, border: `1px solid ${ac}30`, color: ac, fontWeight: 500 }}
    >
      {children}
    </button>
  );
}

/* ─── Gold button ────────────────────────────────────── */
export function GoldBtn({ onClick, children, disabled }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-[12px] font-semibold cursor-pointer disabled:opacity-35 transition-all hover:brightness-105"
      style={{ background: C.gold, color: C.goldText }}
    >
      {children}
    </button>
  );
}

/* ─── Badge pills ────────────────────────────────────── */
export function GoldPill({ label, Icon }: { label: string; Icon?: React.ElementType }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: C.gold, color: C.goldText }}
    >
      {Icon && <Icon size={8} strokeWidth={3} />}{label}
    </span>
  );
}

export function OrangePill({ label, Icon }: { label: string; Icon?: React.ElementType }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
      style={{ background: C.orangeBg, color: C.orange, border: `1px solid ${C.orangeBd}` }}
    >
      {Icon && <Icon size={8} strokeWidth={3} />}{label}
    </span>
  );
}

export function StatusPill({ label, color }: { label: string; color: "green" | "red" | "orange" | "teal" | "violet" | "muted" }) {
  const MAP = {
    green:  { bg: C.greenBg,  text: C.green,   bd: C.greenBd  },
    red:    { bg: C.redBg,    text: C.red,      bd: C.redBd    },
    orange: { bg: C.orangeBg, text: C.orange,   bd: C.orangeBd },
    teal:   { bg: C.tealBg,   text: "#0f766e",  bd: C.tealBd   },
    violet: { bg: C.violetBg, text: "#6d28d9",  bd: C.violetBd },
    muted:  { bg: "#f4f2ee",  text: C.muted,    bd: C.border   },
  };
  const s = MAP[color];
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide"
      style={{ background: s.bg, color: s.text, border: `1px solid ${s.bd}` }}
    >
      {label}
    </span>
  );
}

/* ─── Mini bar sparkline ─────────────────────────────── */
export function Sparkline({ data, accent }: { data: number[]; accent?: string }) {
  const max = Math.max(...data, 1);
  const ac  = accent ?? C.orange;
  return (
    <div className="flex items-end gap-0.5 h-8">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all"
          style={{ height: `${Math.max(3, (v / max) * 28)}px`, background: v > 0 ? ac : C.border }}
        />
      ))}
    </div>
  );
}

/* ─── Circular progress ring ─────────────────────────── */
export function Ring({ pct, size = 52, accent, children }: {
  pct: number; size?: number; accent?: string; children?: React.ReactNode;
}) {
  const ac   = accent ?? C.teal;
  const r    = (size / 2) - 5;
  const circ = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center flex-shrink-0">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={C.border} strokeWidth={3.5} />
        <circle
          cx={size/2} cy={size/2} r={r} fill="none"
          stroke={ac} strokeWidth={3.5}
          strokeDasharray={circ}
          strokeDashoffset={circ - (Math.min(pct,100) / 100) * circ}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

/* ─── Modal backdrop + card ──────────────────────────── */
export function Modal({ onClose, children, width = "420px" }: {
  onClose: () => void; children: React.ReactNode; width?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(10,20,16,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="rounded-[1.5rem] p-7 flex flex-col gap-0"
        style={{
          background: C.card,
          border: `1px solid ${C.border}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.18)",
          width,
          maxWidth: "100%",
        }}
        onClick={e => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ─── Page loader ────────────────────────────────────── */
export function PageLoader() {
  return (
    <div className="flex-1 flex items-center justify-center" style={{ background: "#F4F2EE" }}>
      <div className="flex items-center gap-2.5" style={{ color: "#b8b4ac" }}>
        <div className="w-4 h-4 rounded-full border-2 border-[#E6E1D8] border-t-[#c9a84c] animate-spin" />
        <span className="text-[12px] uppercase tracking-[0.14em]">Loading</span>
      </div>
    </div>
  );
}

/* ─── Veg / Non-veg dot ──────────────────────────────── */
export function VegDot({ isVeg }: { isVeg: boolean }) {
  return (
    <div
      className={`w-[10px] h-[10px] rounded-[3px] border-2 flex-shrink-0 flex items-center justify-center`}
      style={{ borderColor: isVeg ? "#16a34a" : "#dc2626" }}
    >
      <div
        className="w-[4px] h-[4px] rounded-full"
        style={{ background: isVeg ? "#16a34a" : "#dc2626" }}
      />
    </div>
  );
}