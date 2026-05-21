"use client";

import { useState, useCallback } from "react";
import Image             from "next/image";
import LanguageButton    from "@/components/ui/LanguageButton";
import MenuCarouselTrack from "@/components/menu/MenuCarouselTrack";
import { MenuConfig }    from "@/types/menu";
import { ThemeConfig }   from "@/lib/themeConfig";

interface MenuPageClientProps {
  menu:      MenuConfig;
  theme:     ThemeConfig;
  venueSlug: string;
  isEvent:   boolean;
}

export default function MenuPageClient({
  menu,
  theme,
  venueSlug: _venueSlug,
  isEvent:   _isEvent,
}: MenuPageClientProps) {
  // cardIndex 0 = logo card → show first section name
  // cardIndex N = sections[N-1]
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);

  const handleActiveChange = useCallback((cardIndex: number) => {
    // Clamp: logo card (0) shows first section label
    setActiveSectionIdx(Math.max(0, cardIndex - 1));
  }, []);

  const activeSectionName =
    menu.categories[activeSectionIdx]?.name ?? menu.categories[0]?.name ?? "";

  return (
    <div className={`w-full h-svh flex flex-col relative overflow-hidden ${theme.bg}`}>

      {/* ── Background image ── */}
      <Image
        src={theme.bgImage}
        alt="background"
        fill
        priority
        className="z-10 object-cover scale-110 -translate-y-[4%]"
      />

      {/* ── Header ── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-[18px] pb-[10px] flex-shrink-0">
        {/* Left: property logo */}
        <Image
          src="/english-logo.png"
          alt="Kasoori"
          width={500}
          height={500}
          className={`h-[100px] w-auto ${theme.logoFilter}`}
        />

        {/* Centre: venue label with gradient lines */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 whitespace-nowrap min-w-[300px]">
          <div
            className="flex-1 h-[2px] w-[120px]"
            style={{ background: `linear-gradient(to left, ${theme.accentHex}, transparent)` }}
          />
          <span className={`text-[11px] ${theme.tagLine}`}>◆</span>
          <span className={`font-cinzel text-[16px] tracking-[0.18em] uppercase ${theme.accentText}`}>
            {menu.label}
          </span>
          <span className={`text-[11px] ${theme.tagLine}`}>◆</span>
          <div
            className="flex-1 h-[2px] w-[120px]"
            style={{ background: `linear-gradient(to right, ${theme.accentHex}, transparent)` }}
          />
        </div>

        {/* Right: language toggle */}
        <LanguageButton />
      </header>

      {/* ── Active section heading ── */}
      <div className="relative z-10 text-center flex-shrink-0 mb-2">
        <h1 className={`font-yatra text-[26px] font-semibold tracking-[0.05em] uppercase ${theme.headerText}`}>
          {activeSectionName}
        </h1>
      </div>

      {/* ── Carousel (track + dots + arrows) ── */}
      <MenuCarouselTrack
        sections={menu.categories}
        theme={theme}
        onActiveChange={handleActiveChange}
      />

      {/* ── Footer ── */}
      <footer className="relative z-10 text-center pb-[14px] flex-shrink-0">
        <p className={`font-cinzel text-[10px] tracking-[0.1em] ${theme.accentText}`}>
          Please ask your server to place an order
        </p>
      </footer>
    </div>
  );
}