"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Building2,
  UtensilsCrossed,
  CalendarDays,
  QrCode,
  LogOut,
} from "lucide-react";
import { adminLogout } from "@/lib/actions/auth.actions";
import { useState } from "react";

const navItems = [
  { href: "/admin/venues",   label: "Venues & Tables", icon: Building2 },
  { href: "/admin/menus",    label: "Menu Editor",     icon: UtensilsCrossed },
  { href: "/admin/events",   label: "Events",          icon: CalendarDays },
  { href: "/admin/qrcodes", label: "QR Codes",        icon: QrCode },
];

export default function AdminSidebar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await adminLogout();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-56 flex-shrink-0 bg-[#0a0c12] border-r border-white/[0.06] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-2.5">
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z"
              stroke="#c9a84c" strokeWidth="0.8" fill="none" />
            <path d="M14 24V10" stroke="#c9a84c" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-[11px] text-[#c9a84c]"
              style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.15em" }}>
              KASOORI
            </p>
            <p className="text-[9px] text-white/30"
              style={{ fontFamily: "var(--font-cinzel)" }}>
              Admin Panel
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all duration-150
                ${active
                  ? "bg-[#c9a84c]/12 text-[#e8d59a] border border-[#c9a84c]/20"
                  : "text-white/40 hover:text-white/70 hover:bg-white/[0.04] border border-transparent"
                }`}
            >
              <Icon size={15} strokeWidth={1.5} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom — logout */}
      <div className="px-3 py-4 border-t border-white/[0.06] flex flex-col gap-3">
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] text-white/40 hover:text-red-400 hover:bg-red-500/[0.06] border border-transparent transition-all duration-150 cursor-pointer w-full disabled:opacity-50"
        >
          <LogOut size={15} strokeWidth={1.5} />
          <span>{loggingOut ? "Signing out…" : "Sign Out"}</span>
        </button>
        <p className="text-[10px] text-white/20 px-3">Kasoori Methi © 2025</p>
      </div>
    </aside>
  );
}