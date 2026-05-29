"use client";

import { useState, useCallback } from "react";
import Image             from "next/image";
import { Search, X, ShoppingBag } from "lucide-react";
import LanguageButton    from "@/components/ui/LanguageButton";
import MenuCarouselTrack from "@/components/menu/MenuCarouselTrack";
import CartDrawer        from "@/components/menu/CartDrawer";
import { CartProvider, useCart } from "@/context/CartContext";
import { MenuConfig }    from "@/types/menu";
import { ThemeConfig }   from "@/lib/themeConfig";

interface MenuPageClientProps {
  menu:      MenuConfig;
  theme:     ThemeConfig;
  venueSlug: string;
  isEvent:   boolean;
}

function MenuPageInner({
  menu,
  theme,
}: Omit<MenuPageClientProps, "venueSlug" | "isEvent">) {
  const [activeSectionIdx, setActiveSectionIdx] = useState(0);
  const [cartOpen, setCartOpen]                 = useState(false);
  const [searchQuery, setSearchQuery]           = useState("");
  const [searchActive, setSearchActive]         = useState(false);

  const { totalCount } = useCart();

  const handleActiveChange = useCallback((cardIndex: number) => {
    setActiveSectionIdx(Math.max(0, cardIndex - 1));
  }, []);

  const activeSectionName =
    menu.categories[activeSectionIdx]?.name ?? menu.categories[0]?.name ?? "";

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
  };

  return (
    <div className={`w-full h-svh flex flex-col relative overflow-hidden ${theme.bg}`}>

      {/* Background image */}
      <Image
        src={theme.bgImage}
        alt="background"
        fill
        priority
        className="z-0 object-cover scale-110 -translate-y-[4%]"
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 z-[1] bg-black/30" />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-[18px] pb-[10px] flex-shrink-0 gap-4">
        {/* Logo */}
        <Image
          src="/english-logo.png"
          alt="Kasoori"
          width={500}
          height={500}
          className={`h-[80px] w-auto flex-shrink-0 ${theme.logoFilter}`}
        />

        {/* Centre: venue label */}
        {!searchActive && (
          <div className="flex items-center gap-3 whitespace-nowrap flex-1 justify-center">
            <div
              className="flex-1 h-[1px] max-w-[100px]"
              style={{ background: `linear-gradient(to left, ${theme.accentHex}, transparent)` }}
            />
            <span className={`text-[11px] ${theme.tagLine}`}>◆</span>
            <span className={`font-cinzel text-[15px] tracking-[0.18em] uppercase ${theme.accentText}`}>
              {menu.label}
            </span>
            <span className={`text-[11px] ${theme.tagLine}`}>◆</span>
            <div
              className="flex-1 h-[1px] max-w-[100px]"
              style={{ background: `linear-gradient(to right, ${theme.accentHex}, transparent)` }}
            />
          </div>
        )}

        {/* Search bar (expands when active) */}
        {searchActive && (
          <div className="flex-1 flex items-center gap-2 relative">
            <div
              className="flex-1 flex items-center gap-2 rounded-[10px] px-3 py-2"
              style={{ background: "rgba(255,255,255,0.08)", border: `1px solid ${theme.accentHex}30` }}
            >
              <Search size={14} style={{ color: theme.accentHex }} className="flex-shrink-0" />
              <input
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dishes…"
                className="flex-1 bg-transparent outline-none font-cormorant text-[14px] text-white/90 placeholder-white/30"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-white/40 hover:text-white/70 cursor-pointer">
                  <X size={14} />
                </button>
              )}
            </div>
            <button
              onClick={clearSearch}
              className="font-cinzel text-[11px] tracking-wider cursor-pointer hover:opacity-80 transition-opacity flex-shrink-0"
              style={{ color: theme.accentHex }}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Right: search + language + cart */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {!searchActive && (
            <button
              onClick={() => setSearchActive(true)}
              className="p-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
              style={{ color: theme.accentHex }}
            >
              <Search size={18} />
            </button>
          )}
          <LanguageButton />
          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: theme.accentHex }}
          >
            <ShoppingBag size={18} />
            {totalCount > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center font-cinzel text-black"
                style={{ background: theme.accentHex }}
              >
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Active section heading */}
      <div className="relative z-10 text-center flex-shrink-0 mb-1">
        {searchQuery ? (
          <p className={`font-cinzel text-[12px] tracking-[0.12em] uppercase ${theme.accentText} opacity-70`}>
            Results for &ldquo;{searchQuery}&rdquo;
          </p>
        ) : (
          <h1 className={`font-yatra text-[26px] font-semibold tracking-[0.05em] uppercase ${theme.headerText}`}>
            {activeSectionName}
          </h1>
        )}
      </div>

      {/* Carousel */}
      <MenuCarouselTrack
        sections={menu.categories}
        theme={theme}
        onActiveChange={handleActiveChange}
        searchQuery={searchQuery}
      />

      {/* Footer */}
      <footer className="relative z-10 text-center pb-[14px] flex-shrink-0">
        {totalCount > 0 ? (
          <button
            onClick={() => setCartOpen(true)}
            className="font-cinzel text-[10px] tracking-[0.1em] cursor-pointer hover:opacity-80 transition-opacity"
            style={{ color: theme.accentHex }}
          >
            {totalCount} item{totalCount !== 1 ? "s" : ""} selected — tap to review
          </button>
        ) : (
          <p className={`font-cinzel text-[10px] tracking-[0.1em] ${theme.accentText}`}>
            Tap a dish to add it · Show your server to order
          </p>
        )}
      </footer>

      {/* Cart drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} theme={theme} />
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