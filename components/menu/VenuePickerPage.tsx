"use client";

import Image from "next/image";
import Link  from "next/link";

// ── Venue definitions ─────────────────────────────────────────
// Add new static venues here; event venues are never listed.
const venues = [
  {
    slug:        "restaurant",
    label:       "Restaurant",
    sublabel:    "Main dining hall",
    menuLabel:   "Restaurant Menu",
    bgImage:     "/bg-restaurant.png",
    accentHex:   "#d4af6a",
    // Tailwind classes used on the card accent elements
    accentText:  "text-[#d4af6a]",
    borderIdle:  "border-[#d4af6a]/20",
    borderHover: "hover:border-[#d4af6a]/60",
    dotColor:    "bg-[#d4af6a]",
  },
  {
    slug:        "pool",
    label:       "Pool Side",
    sublabel:    "Outdoor pool deck",
    menuLabel:   "Pool Menu",
    bgImage:     "/bg-texture-pool.png",
    accentHex:   "#d4af6a",
    accentText:  "text-[#d4af6a]",
    borderIdle:  "border-[#d4af6a]/20",
    borderHover: "hover:border-[#d4af6a]/60",
    dotColor:    "bg-[#d4af6a]",
  },
  {
    slug:        "lobby",
    label:       "Lobby Café",
    sublabel:    "Ground floor lounge",
    menuLabel:   "Lobby Café Menu",
    bgImage:     "/image.png",
    accentHex:   "#d4af6a",
    accentText:  "text-[#d4af6a]",
    borderIdle:  "border-[#d4af6a]/20",
    borderHover: "hover:border-[#d4af6a]/60",
    dotColor:    "bg-[#d4af6a]",
  },
] as const;

export default function VenuePickerPage() {
  return (
    <div className="relative w-full h-svh flex flex-col items-center justify-center overflow-hidden bg-[#0e0c08]">

      {/* ── Shared background — restaurant image, heavily dimmed ── */}
      <Image
        src="/image.png"
        alt=""
        fill
        priority
        className="-z-10 object-cover opacity-30 scale-110"
      />

      {/* ── Subtle radial vignette ── */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 30%, #0e0c08 100%)",
        }}
      />

      {/* ── Header ── */}
      <header className="flex flex-col items-center gap-3 mb-10">
        <Image
          src="/image-Photoroom.png"
          alt="Kasoori logo mark"
          width={56}
          height={56}
          className="h-14 w-auto"
        />
        <Image
          src="/double-text-logo.png"
          alt="Kasoori"
          width={140}
          height={48}
          className="h-12 w-auto"
        />

        {/* Divider + prompt */}
        <div className="flex items-center gap-3 mt-2">
          <div className="h-px w-16" style={{ background: "linear-gradient(to left, #d4af6a80, transparent)" }} />
          <span className="font-cinzel text-[11px] tracking-[0.2em] text-[#d4af6a]/70 uppercase">
            Select a Venue
          </span>
          <div className="h-px w-16" style={{ background: "linear-gradient(to right, #d4af6a80, transparent)" }} />
        </div>
      </header>

      {/* ── Venue cards ── */}
      <div className="flex flex-col gap-3 w-full max-w-sm px-6">
        {venues.map((venue) => (
          <Link
            key={venue.slug}
            href={`/menu?venue=${venue.slug}`}
            className={`group relative flex items-center gap-4 rounded-2xl border bg-white/[0.03] backdrop-blur-sm px-5 py-4 transition-all duration-200 ${venue.borderIdle} ${venue.borderHover} hover:bg-white/[0.06]`}
          >
            {/* Thumbnail — venue bg image, small */}
            <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border border-white/10">
              <Image
                src={venue.bgImage}
                alt={venue.label}
                fill
                className="object-cover opacity-70 group-hover:opacity-90 transition-opacity duration-200"
              />
            </div>

            {/* Labels */}
            <div className="flex-1 min-w-0">
              <p
                className="font-cinzel text-[13px] tracking-[0.08em] text-white/90 leading-tight"
              >
                {venue.label}
              </p>
              <p className="font-cormorant text-[11px] mt-0.5 text-white/35 italic">
                {venue.sublabel}
              </p>
            </div>

            {/* Menu label + arrow */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`font-cinzel text-[10px] tracking-[0.06em] ${venue.accentText} opacity-70 group-hover:opacity-100 transition-opacity`}
              >
                {venue.menuLabel}
              </span>
              <span className={`text-[16px] leading-none ${venue.accentText} opacity-50 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all`}>
                ›
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Footer ── */}
      <footer className="absolute bottom-5 text-center">
        <p className="font-cinzel text-[9px] tracking-[0.12em] text-white/20 uppercase">
          Scan a table QR code to go directly to your menu
        </p>
      </footer>
    </div>
  );
}