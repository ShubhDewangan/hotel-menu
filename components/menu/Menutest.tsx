"use client";

import { useRef } from "react";

const CARD_WIDTH = 240;
const GAP = 16;
const STEP = CARD_WIDTH + GAP;

interface SnapScrollProps {
  children: React.ReactNode[];
}

export default function SnapScroll({ children }: SnapScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    ref.current?.scrollBy({ left: dir === "right" ? STEP : -STEP, behavior: "smooth" });
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Scrollable track */}
      <div
        ref={ref}
        style={{
          display: "flex",
          gap: GAP,
          overflowX: "scroll",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          padding: "0 16px",
        }}
      >
        <style>{`.snap-hide::-webkit-scrollbar { display: none; }`}</style>

        {children.map((child, i) => (
          <div
            key={i}
            style={{
              scrollSnapAlign: "start",
              flexShrink: 0,
              width: CARD_WIDTH,
            }}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Left arrow */}
      <button
        onClick={() => scroll("left")}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#c9a84c",
          fontSize: 24,
          lineHeight: 1,
          padding: "0 4px",
        }}
      >
        ‹
      </button>

      {/* Right arrow */}
      <button
        onClick={() => scroll("right")}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#c9a84c",
          fontSize: 24,
          lineHeight: 1,
          padding: "0 4px",
        }}
      >
        ›
      </button>
    </div>
  );
}