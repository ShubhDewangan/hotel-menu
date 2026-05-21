"use client";

import { useRef, useState, useCallback } from "react";

const cards = [
  { id: 1, color: "#1a1108" },
  { id: 2, color: "#0b1e2d" },
  { id: 3, color: "#1c1810" },
  { id: 4, color: "#12111a" },
  { id: 5, color: "#0d1a0d" },
];

const CARD_W = 340;
const GAP    = 24;
const STEP   = CARD_W + GAP;

export default function Page() {
  const trackRef            = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  // per-card scale derived from scroll position (0–1, 1 = fully active)
  const [scales, setScales] = useState<number[]>(cards.map((_, i) => i === 0 ? 1 : 0.82));

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const scrollLeft = el.scrollLeft;
    const nearest    = Math.round(scrollLeft / STEP);
    setActive(nearest);

    // compute a continuous scale for each card based on distance from scroll center
    const newScales = cards.map((_, i) => {
      const dist = Math.abs(scrollLeft / STEP - i); // 0 = centered, 1 = one card away
      const scale = 1 - Math.min(dist, 1) * 0.18;   // range: 0.82 → 1.0
      return Math.max(0.82, scale);
    });
    setScales(newScales);
  }, []);

  const scrollTo = (index: number) => {
    const clamped = Math.max(0, Math.min(index, cards.length - 1));
    trackRef.current?.scrollTo({ left: clamped * STEP, behavior: "smooth" });
  };

  return (
    <div style={{ width: "100%", height: "100svh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#111", overflow: "hidden", gap: 32 }}>
      <style>{`.track::-webkit-scrollbar { display: none; }`}</style>

      {/* Track */}
      <div
        ref={trackRef}
        className="track"
        onScroll={onScroll}
        style={{
          display: "flex",
          alignItems: "center",
          gap: GAP,
          overflowX: "scroll",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          width: "100%",
          padding: `0 calc(50% - ${CARD_W / 2}px)`,
          cursor: "grab",
        }}
      >
        {cards.map((card, i) => (
          <div
            key={card.id}
            onClick={() => scrollTo(i)}
            style={{
              scrollSnapAlign: "center",
              flexShrink: 0,
              width: CARD_W,
              height: 480,
              borderRadius: 24,
              backgroundColor: card.color,
              border: `1px solid ${i === active ? "#ffffff55" : "#ffffff18"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              color: i === active ? "#ffffff66" : "#ffffff22",
              fontWeight: 700,
              userSelect: "none",
              transform: `scale(${scales[i]})`,
              opacity: 0.4 + scales[i] * 0.6,
              // no transition here — updates continuously while scrolling
            }}
          >
            {card.id}
          </div>
        ))}
      </div>

      {/* Arrows + dots row — fixed height so dots never move */}
      <div style={{ display: "flex", alignItems: "center", gap: 24, height: 32 }}>
        {/* Left arrow */}
        <button
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          style={{
            background: "none",
            border: "none",
            color: active === 0 ? "#ffffff22" : "#ffffff",
            fontSize: 28,
            cursor: active === 0 ? "not-allowed" : "pointer",
            lineHeight: 1,
            padding: 0,
            transition: "color 0.2s",
          }}
        >
          ‹
        </button>

        {/* Dots — fixed width container so layout never shifts */}
        <div style={{ display: "flex", gap: 8, alignItems: "center", width: cards.length * 8 + (cards.length - 1) * 8 + 16 }}>
          {cards.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              style={{
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: i === active ? "#ffffff" : "#ffffff44",
                border: "none",
                cursor: "pointer",
                padding: 0,
                outline: i === active ? "2px solid #ffffff88" : "none",
                outlineOffset: 2,
                transition: "background-color 0.3s, outline 0.3s",
                flexShrink: 0,
              }}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scrollTo(active + 1)}
          disabled={active === cards.length - 1}
          style={{
            background: "none",
            border: "none",
            color: active === cards.length - 1 ? "#ffffff22" : "#ffffff",
            fontSize: 28,
            cursor: active === cards.length - 1 ? "not-allowed" : "pointer",
            lineHeight: 1,
            padding: 0,
            transition: "color 0.2s",
          }}
        >
          ›
        </button>
      </div>
    </div>
  );
}