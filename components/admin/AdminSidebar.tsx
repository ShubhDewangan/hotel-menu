"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Building2, UtensilsCrossed, CalendarDays, LogOut } from "lucide-react";
import { adminLogout } from "@/lib/actions/auth.actions";
import { useState } from "react";

const navItems = [
  { href: "/admin/venues", label: "Venues & Tables", icon: Building2 },
  { href: "/admin/menus",  label: "Menu Editor",     icon: UtensilsCrossed },
  { href: "/admin/events", label: "Events",          icon: CalendarDays },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router   = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await adminLogout();
    window.location.href = "/admin/login";
  };

  return (
    <aside className="w-52 flex-shrink-0 bg-[#08090e] border-r border-white/[0.05] flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-2.5">
          <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke="#c9a84c" strokeWidth="0.8" fill="none" />
            <path d="M14 24V10" stroke="#c9a84c" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          <div>
            <p className="text-[11px] text-[#c9a84c]/80" style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.15em" }}>KASOORI</p>
            <p className="text-[9px] text-white/20" style={{ fontFamily: "var(--font-cinzel)" }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] transition-all duration-150 ${
                active
                  ? "bg-white/[0.06] text-white/80 border border-white/[0.07]"
                  : "text-white/30 hover:text-white/60 hover:bg-white/[0.03] border border-transparent"
              }`}>
              <Icon size={14} strokeWidth={1.5} className={active ? "text-[#c9a84c]/80" : ""} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-white/[0.04]">
        <button onClick={handleLogout} disabled={loggingOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] text-white/25 hover:text-red-400/70 hover:bg-red-500/[0.05] border border-transparent w-full transition-all cursor-pointer disabled:opacity-40">
          <LogOut size={14} strokeWidth={1.5} />
          {loggingOut ? "Signing out…" : "Sign Out"}
        </button>
        <p className="text-[9px] text-white/10 px-3 mt-3">Kasoori Methi © 2025</p>
      </div>
    </aside>
  );
}