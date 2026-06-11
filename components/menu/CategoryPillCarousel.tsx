"use client";

import { useRef, useEffect, useCallback } from "react";
import { MenuCategory } from "@/types/menu";
import { ThemeConfig }  from "@/lib/themeConfig";

interface CategoryPillCarouselProps {
  categories: MenuCategory[];
  activeId:   string;
  onSelect:   (id: string) => void;
  theme:      ThemeConfig;
}

const MIN_PILL_W = 350;
const GAP        = 20;

export default function CategoryPillCarousel({
  categories,
  activeId,
  onSelect,
}: CategoryPillCarouselProps) {
  const trackRef     = useRef<HTMLDivElement>(null);
  const programmatic = useRef(false);
  const mounted      = useRef(false);

  const recalcPadding = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const firstBtn = el.querySelector<HTMLButtonElement>("button[data-name]");
    if (!firstBtn) return;
    const pad = el.offsetWidth / 2 - firstBtn.offsetWidth / 2;
    el.style.paddingLeft  = `${pad}px`;
    el.style.paddingRight = `${pad}px`;
  }, []);

  const scrollToBtn = useCallback((idx: number, behavior: ScrollBehavior = "smooth") => {
    const el = trackRef.current;
    if (!el) return;
    const btns = el.querySelectorAll<HTMLButtonElement>("button[data-name]");
    const btn  = btns[idx];
    if (!btn) return;
    const target = btn.offsetLeft - (el.offsetWidth / 2 - btn.offsetWidth / 2);
    el.scrollTo({ left: Math.max(0, target), behavior });
  }, []);

  // Mount only: recalc padding first, then instant jump
  useEffect(() => {
    requestAnimationFrame(() => {
      recalcPadding();
      const idx = categories.findIndex((c) => c.name === activeId);
      scrollToBtn(idx !== -1 ? idx : 0, "instant" as ScrollBehavior);
      mounted.current = true;
    });
  }, []); // eslint-disable-line

  // Recalc padding when categories change (e.g. data loads late)
  useEffect(() => {
    requestAnimationFrame(recalcPadding);
  }, [categories, recalcPadding]);

  // External activeId change (e.g. search auto-navigation): smooth scroll
  useEffect(() => {
    if (!mounted.current) return;
    programmatic.current = true;
    const idx = categories.findIndex((c) => c.name === activeId);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        recalcPadding();
        scrollToBtn(idx !== -1 ? idx : 0, "smooth");
        setTimeout(() => { programmatic.current = false; }, 700);
      });
    });
  }, [activeId]); // eslint-disable-line

  // User drag scroll: select centered pill on settle
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const selectCentered = () => {
      if (programmatic.current) return;
      const trackMid = el.scrollLeft + el.offsetWidth / 2;
      let bestName = "";
      let bestDist = Infinity;
      el.querySelectorAll<HTMLButtonElement>("button[data-name]").forEach((btn) => {
        const dist = Math.abs((btn.offsetLeft + btn.offsetWidth / 2) - trackMid);
        if (dist < bestDist) { bestDist = dist; bestName = btn.dataset.name ?? ""; }
      });
      if (bestName && bestName !== activeId) onSelect(bestName);
    };

    let timer: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      if (programmatic.current) return;
      clearTimeout(timer);
      timer = setTimeout(selectCentered, 80);
    };

    const supportsScrollEnd = "onscrollend" in window;

    if (supportsScrollEnd) {
      el.addEventListener("scrollend", selectCentered, { passive: true });
    } else {
      el.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      clearTimeout(timer);
      if (supportsScrollEnd) {
        el.removeEventListener("scrollend", selectCentered);
      } else {
        el.removeEventListener("scroll", onScroll);
      }
    };
  }, [activeId, onSelect]);

  const handleClick = (name: string, idx: number) => {
    programmatic.current = true;
    onSelect(name);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        recalcPadding();
        scrollToBtn(idx, "smooth");
        const el = trackRef.current;
        if (el) {
          el.addEventListener(
            "scrollend",
            () => { programmatic.current = false; },
            { once: true }
          );
        }
        // Safari fallback
        setTimeout(() => { programmatic.current = false; }, 700);
      });
    });
  };

  return (
    <div className="relative flex-shrink-0 w-full z-10">
      {/* <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-black/70 to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-black/70 to-transparent" /> */}

      <div
        ref={trackRef}
        className="flex overflow-x-auto cursor-grab active:cursor-grabbing [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-4"
        style={{
          gap:                     GAP,
          scrollSnapType:          "x mandatory",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {categories.map((cat, idx) => {
          const isActive = cat.name === activeId;
          return (
            <button
              key={cat.name}
              data-name={cat.name}
              onClick={() => handleClick(cat.name, idx)}
              className={[
                "flex-shrink-0 flex items-center justify-center",
                "rounded-2xl border border-[#e9d087] cursor-pointer",
                "font-yatra text-5xl font-bold py-10",
                "bg-clip-text text-transparent",
                "bg-gradient-to-r from-[#B38728] via-[#FBF5B7] to-[#AA771C]",
                "transition-all duration-300 ease-out [scroll-snap-align:center]",
                isActive
                  ? "bg-amber-100/80 scale-100 opacity-100 shadow-lg shadow-[#e9d087]/20"
                  : "bg-amber-100/70 scale-95 opacity-60",
              ].join(" ")}
              style={{ minWidth: MIN_PILL_W, width: "clamp(350px, 30vw, 450px)" }}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}