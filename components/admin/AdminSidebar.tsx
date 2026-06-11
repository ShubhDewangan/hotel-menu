"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, UtensilsCrossed, CalendarDays, LogOut, LayoutDashboard } from "lucide-react";
import { adminLogout } from "@/lib/actions/auth.actions";
import { useState } from "react";
import Image from "next/image";

/* ─── Sidebar design tokens ──────────────────────────
   Deep forest green — matches reference image sidebar
─────────────────────────────────────────────────────── */
const S = {
  bg:      "#0d1f1a",
  card:    "#122920",
  border:  "rgba(61,214,163,0.1)",
  teal:    "#3dd6a3",
  textPri: "rgba(240,245,240,0.82)",
  textMut: "rgba(180,210,195,0.38)",
};

const navItems = [
  { href: "/admin",         label: "Dashboard",      icon: LayoutDashboard, exact: true,  accent: "#c9a84c" },
  { href: "/admin/venues",  label: "Venues & Tables", icon: Building2,       exact: false, accent: "#3dd6a3" },
  { href: "/menus",   label: "Menu Editor",     icon: UtensilsCrossed, exact: false, accent: "#c9a84c" },
  { href: "/admin/events",  label: "Events",          icon: CalendarDays,    exact: false, accent: "#9b8fd4" },
];

export default function AdminSidebar() {
  const pathname    = usePathname();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await adminLogout();
    window.location.href = "/admin/login";
  };

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return (
    <aside
      className="flex flex-col h-screen w-[17rem] flex-shrink-0 p-3 gap-2"
      style={{ background: S.bg }}
    >
      {/* ── Logo card ── */}
      <div
        className="flex items-center gap-3 px-4 py-3.5 rounded-2xl mb-1"
        style={{ background: S.card, border: `1px solid ${S.border}` }}
      >
        <Image src="/english-logo.png" alt="Kasoori" height={36} width={36} className="opacity-90 flex-shrink-0" />
        <div>
          <p
            className="text-[15px] font-semibold leading-tight"
            style={{ color: S.textPri, fontFamily: "var(--font-cormorant)", letterSpacing: "0.04em" }}
          >
            Kasoori
          </p>
          <p className="text-[10px] tracking-[0.18em] uppercase" style={{ color: S.textMut }}>
            Admin Panel
          </p>
        </div>
      </div>

      {/* ── Nav label ── */}
      <p className="text-[9px] uppercase tracking-[0.22em] px-4 mt-1" style={{ color: S.textMut }}>
        Navigation
      </p>

      {/* ── Nav items ── */}
      <nav className="flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon, exact, accent }) => {
          const active = isActive(href, exact);
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] transition-all duration-150 group"
              style={{
                background:  active ? `${accent}14` : "transparent",
                border:      active ? `1px solid ${accent}28` : "1px solid transparent",
                color:       active ? accent : S.textMut,
              }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all"
                style={{ background: active ? `${accent}18` : "rgba(255,255,255,0.04)" }}
              >
                <Icon
                  size={13}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? accent : S.textMut }}
                />
              </div>
              <span
                className="transition-all"
                style={{
                  fontWeight:    active ? 500 : 400,
                  letterSpacing: active ? "0.01em" : "0",
                  color:         active ? accent : S.textMut,
                }}
              >
                {label}
              </span>
              {active && (
                <span
                  className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: accent }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── Spacer ── */}
      <div className="flex-1" />

      {/* ── Divider ── */}
      <div className="mx-3 h-px" style={{ background: S.border }} />

      {/* ── User / logout ── */}
      <div className="px-1 py-2">
        <p className="text-[9px] uppercase tracking-[0.22em] px-3 mb-2" style={{ color: S.textMut }}>
          User Account
        </p>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] transition-all cursor-pointer disabled:opacity-40 group"
          style={{
            background: "transparent",
            border: "1px solid transparent",
            color: S.textMut,
          }}
          onMouseEnter={e => {
            const el = e.currentTarget;
            el.style.background = "rgba(239,68,68,0.07)";
            el.style.border     = "1px solid rgba(239,68,68,0.15)";
            el.style.color      = "rgba(248,113,113,0.75)";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget;
            el.style.background = "transparent";
            el.style.border     = "1px solid transparent";
            el.style.color      = S.textMut;
          }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            <LogOut size={13} strokeWidth={1.8} />
          </div>
          <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
        </button>
        <p className="text-[9px] text-center mt-3 tracking-widest uppercase" style={{ color: "rgba(61,214,163,0.15)" }}>
          Kasoori © 2025
        </p>
      </div>
    </aside>
  );
}