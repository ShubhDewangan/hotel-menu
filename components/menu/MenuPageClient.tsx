/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/refs */
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image                     from "next/image";
import { Search, X, ShoppingBag } from "lucide-react";
import LanguageButton            from "@/components/ui/LanguageButton";
import CategoryPillCarousel      from "@/components/menu/CategoryPillCarousel";
import MenuItemsList             from "@/components/menu/MenuItemsList";
import CartDrawer                from "@/components/menu/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { MenuConfig }            from "@/types/menu";
import { ThemeConfig }           from "@/lib/themeConfig";
import Searchbar from "../ui/Searchbar";

interface MenuPageClientProps {
  menu:      MenuConfig;
  theme:     ThemeConfig;
  venueSlug: string;
  isEvent:   boolean;
}

function MenuPageInner({ menu, theme }: Omit<MenuPageClientProps, "venueSlug" | "isEvent">) {
  const [activeCategory, setActiveCategory] = useState<string>(
    menu.categories[0]?.name ?? ""
  );
  const [cartOpen,    setCartOpen]    = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { totalCount } = useCart();
   const [isMd, setIsMd]        = useState(false);

  const visited = useRef<Set<string>>(new Set([menu.categories[0]?.name ?? ""]));

  const handleCategorySelect = useCallback((name: string) => {
    visited.current.add(name);
    setActiveCategory(name);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    setIsMd(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMd(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Auto-navigate to the first category that contains a search match ──
  useEffect(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    const matchingCat = menu.categories.find((cat) =>
      cat.items.some(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          (item.description?.toLowerCase().includes(q) ?? false)
      )
    );

    if (matchingCat && matchingCat.name !== activeCategory) {
      handleCategorySelect(matchingCat.name);
      // small delay so carousel useEffect fires after state settles
    }
  }, [searchQuery]); // eslint-disable-line

  const hasBg = !!theme.bgImage;

  return (
    <div className="w-full h-svh flex flex-row overflow-hidden relative">

      {/* Background */}
      {hasBg && (
        <Image src={theme.bgImage} alt="background" fill priority className="z-0 object-cover brightness-50" />
      )}
      {!hasBg && <div className="absolute inset-0 z-0" style={{ background: "#07151f" }} />}
      <div className="absolute inset-0 z-[1] bg-black/25" />

      {/* ── Main content column ─────────────────────────────────────────── */}
      <div
        className="relative z-10 flex flex-col overflow-hidden transition-all duration-300 ease-in-out"
        style={{ flex: cartOpen ? "1 1 0%" : "1 1 100%" }}
      >
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-4 flex-shrink-0 gap-4">
          <div className="w-[200px]">
            <Image
            src="/english-logo.png"
            alt="Kasoori"
            width={500}
            height={500}
            className={`h-[72px] w-auto flex-shrink-0 ${theme.logoFilter} brightness-150`}
          />
          </div>

          {/* Search bar */}
          <div className="hidden md:block">
            <Searchbar value={searchQuery} onChange={setSearchQuery} />
          </div>

          {/* Right */}
          <div className="flex items-center gap-3 flex-shrink-0 w-[200px]">
            <LanguageButton />
            <button
              onClick={() => setCartOpen((o) => !o)}
              className="relative p-2 cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: theme.accentHex }}
            >
              <ShoppingBag size={20} />
              {totalCount > 0 && (
                <span
                  className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full text-[9px] font-bold flex items-center justify-center font-cinzel text-black"
                  style={{ background: theme.accentHex }}
                >
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </header>

        <div className="block md:hidden px-5 pb-5">
          <Searchbar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Venue label */}
        <div className="flex items-center justify-center gap-3 flex-shrink-0 pb-1">
          <div className="h-px w-16 opacity-60" style={{ background: `linear-gradient(to left, ${theme.accentHex}, transparent)` }} />
          <span className={`text-[10px] opacity-60 ${theme.tagLine}`}>◆</span>
          <span className={`font-dm-serif text-[15px] tracking-[0.2em] uppercase ${theme.accentText}`}>
            {menu.label}
          </span>
          <span className={`text-[10px] opacity-60 ${theme.tagLine}`}>◆</span>
          <div className="h-px w-16 opacity-60" style={{ background: `linear-gradient(to right, ${theme.accentHex}, transparent)` }} />
        </div>

        {/* Category pill carousel — activeId drives its own scroll internally */}
        <CategoryPillCarousel
          categories={menu.categories}
          activeId={activeCategory}
          onSelect={handleCategorySelect}
          theme={theme}
        />

        {/* Parchment content area */}
        <div
          className="relative flex-1 mx-5 mb-5 rounded-2xl overflow-hidden flex flex-col"
          style={{
            background:     "rgba(238, 224, 181, 0.82)",
            border:         `2px solid ${theme.accentHex}60`,
            backdropFilter: "blur(10px)",
          }}
        >
          <div className="flex-1 relative overflow-hidden">
            {menu.categories.map((cat) => {
              const isActive   = cat.name === activeCategory;
              const wasVisited = visited.current.has(cat.name);
              if (!wasVisited && !isActive) return null;

              return (
                <div
                  key={cat.name}
                  className="absolute inset-0 overflow-y-auto custom-scrollbar"
                  style={{
                    visibility:    isActive ? "visible" : "hidden",
                    pointerEvents: isActive ? "auto"    : "none",
                  }}
                >
                  <MenuItemsList
                    section={cat}
                    theme={theme}
                    searchQuery={searchQuery}
                  />
                  <div className="h-6" />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        {totalCount > 0 && (
          <div className="flex-shrink-0 pb-4 -mt-3 text-center">
            <button
              onClick={() => setCartOpen(true)}
              className="font-mono text-[10px] tracking-[0.12em] cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: theme.accentHex }}
            >
              {totalCount} item{totalCount !== 1 ? "s" : ""} selected — tap to review
            </button>
          </div>
        )}
      </div>

      {/* ── Cart panel ──────────────────────────────────────────────────── */}
      {/* ── Cart panel — desktop split only ──────────────────────────── */}
      {isMd && (
        <div
          className="relative z-10 flex-shrink-0 transition-all duration-300 ease-in-out overflow-hidden"
          style={{ width: cartOpen ? "360px" : "0px", opacity: cartOpen ? 1 : 0 }}
        >
          <div className="w-[360px] h-full">
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} theme={theme} inline />
          </div>
        </div>
      )}

      {/* ── Cart panel — mobile fixed overlay ────────────────────────── */}
      {!isMd && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} theme={theme} />
      )}
    </div>
  );
}

export default function MenuPageClient(props: MenuPageClientProps) {
  return (
    <CartProvider>
      <MenuPageInner menu={props.menu} theme={props.theme} />
    </CartProvider>
  );
}