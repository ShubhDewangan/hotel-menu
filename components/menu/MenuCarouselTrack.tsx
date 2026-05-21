"use client";

import { useRef, useState, useCallback } from "react";
import MenuLogoCard    from "@/components/menu/MenuLogoCard";
import MenuSectionCard from "@/components/menu/MenuSectionCard";
import { MenuCategory } from "@/types/menu";
import { ThemeConfig }  from "@/lib/themeConfig";

// ── Constants — match the original test pages exactly ─────────
const CARD_W = 500;
const CARD_H = 600;
const GAP    = 24;
const STEP   = CARD_W + GAP;

interface MenuCarouselTrackProps {
  sections:       MenuCategory[];
  theme:          ThemeConfig;
  onActiveChange: (cardIndex: number) => void;
}

export default function MenuCarouselTrack({
  sections,
  theme,
  onActiveChange,
}: MenuCarouselTrackProps) {
  const trackRef   = useRef<HTMLDivElement>(null);
  const totalCards = sections.length + 1; // logo card + N section cards

  const [active, setActive] = useState(0);
  const [scales, setScales] = useState<number[]>(() =>
    // Card 0 (logo) starts centred and full-size; rest at 0.85
    Array.from({ length: totalCards }, (_, i) => (i === 0 ? 1 : 0.85))
  );

  // Called on every scroll tick — updates active index + scale array
  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const next = Math.round(el.scrollLeft / STEP);
    setActive(next);
    onActiveChange(next);

    setScales(
      Array.from({ length: totalCards }, (_, i) =>
        // Scale falls from 1.0 → 0.85 linearly as the card moves
        // away from the centre, clamped at 0.85 for off-screen cards.
        Math.max(0.85, 1 - Math.min(Math.abs(el.scrollLeft / STEP - i), 1) * 0.15)
      )
    );
  }, [totalCards, onActiveChange]);

  const scrollTo = (index: number) => {
    trackRef.current?.scrollTo({
      left:     Math.max(0, Math.min(index, totalCards - 1)) * STEP,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* ── Scrollable track ── */}
      <style>{`.menu-track::-webkit-scrollbar { display: none }`}</style>
      <div
        ref={trackRef}
        className="menu-track relative z-10 flex items-center overflow-x-scroll flex-1 cursor-grab active:cursor-grabbing"
        onScroll={onScroll}
        style={{
          gap:                    GAP,
          scrollSnapType:         "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth:         "none",
          // Centre the active card regardless of viewport width
          padding: `0 calc(50% - ${CARD_W / 2}px)`,
        }}
      >
        {/* Slide 0 — logo only */}
        <MenuLogoCard
          scale={scales[0]}
          opacity={0.4 + scales[0] * 0.6}
          cardWidth={CARD_W}
          cardHeight={CARD_H}
          theme={theme}
        />

        {/* Slides 1…N — one per menu section */}
        {sections.map((section, i) => (
          <MenuSectionCard
            key={i}
            section={section}
            scale={scales[i + 1]}
            opacity={0.4 + scales[i + 1] * 0.6}
            cardWidth={CARD_W}
            cardHeight={CARD_H}
            theme={theme}
          />
        ))}
      </div>

      {/* ── Arrows + dot pagination ── */}
      <div className="relative z-10 flex items-center justify-center gap-5 py-3 flex-shrink-0">
        <button
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          className={`bg-transparent border-none text-[26px] leading-none p-0 transition-opacity ${
            active === 0
              ? `${theme.arrowColor} opacity-20 cursor-not-allowed`
              : `${theme.arrowColor} cursor-pointer`
          }`}
        >
          ‹
        </button>

        <div className="flex gap-2 items-center">
          {Array.from({ length: totalCards }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`h-2 rounded-full border-none p-0 flex-shrink-0 cursor-pointer transition-all duration-300 ${
                i === active
                  ? `w-5 ${theme.dotActive} outline outline-2 outline-offset-2 ${theme.dotActive}/50`
                  : `w-2 ${theme.dotInactive}`
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo(active + 1)}
          disabled={active === totalCards - 1}
          className={`bg-transparent border-none text-[26px] leading-none p-0 transition-opacity ${
            active === totalCards - 1
              ? `${theme.arrowColor} opacity-20 cursor-not-allowed`
              : `${theme.arrowColor} cursor-pointer`
          }`}
        >
          ›
        </button>
      </div>
    </>
  );
}