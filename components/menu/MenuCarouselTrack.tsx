/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import MenuLogoCard    from "@/components/menu/MenuLogoCard";
import MenuSectionCard from "@/components/menu/MenuSectionCard";
import { MenuCategory } from "@/types/menu";
import { ThemeConfig }  from "@/lib/themeConfig";

const CARD_W = 500;
const CARD_H = 600;
const GAP    = 24;
const STEP   = CARD_W + GAP;

interface MenuCarouselTrackProps {
  sections:       MenuCategory[];
  theme:          ThemeConfig;
  onActiveChange: (cardIndex: number) => void;
  searchQuery?:   string;
}

export default function MenuCarouselTrack({
  sections = [],
  theme,
  onActiveChange,
  searchQuery = "",
}: MenuCarouselTrackProps) {
  const trackRef   = useRef<HTMLDivElement>(null);
  const totalCards = sections.length + 1;

  const [active, setActive] = useState(0);
  const [scales, setScales] = useState<number[]>(() =>
    Array.from({ length: totalCards }, (_, i) => (i === 0 ? 1 : 0.85))
  );

  // Auto-scroll to first section that has a match
  useEffect(() => {
    if (!searchQuery.trim()) return;
    const q = searchQuery.toLowerCase();
    const firstMatchIdx = sections.findIndex((s) =>
      s.items.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.description?.toLowerCase().includes(q)
      )
    );
    if (firstMatchIdx !== -1) {
      scrollTo(firstMatchIdx + 1); // +1 for logo card
    }
  }, [searchQuery]); // eslint-disable-line

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.round(el.scrollLeft / STEP);
    setActive(next);
    onActiveChange(next);
    setScales(
      Array.from({ length: totalCards }, (_, i) =>
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
          padding: `0 calc(50% - ${CARD_W / 2}px)`,
        }}
      >
        <MenuLogoCard
          scale={scales[0]}
          opacity={0.4 + scales[0] * 0.6}
          cardWidth={CARD_W}
          cardHeight={CARD_H}
          theme={theme}
        />
        {sections.map((section, i) => (
          <MenuSectionCard
            key={i}
            section={section}
            scale={scales[i + 1]}
            opacity={0.4 + scales[i + 1] * 0.6}
            cardWidth={CARD_W}
            cardHeight={CARD_H}
            theme={theme}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Arrows + dots */}
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