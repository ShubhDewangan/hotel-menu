"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";

const sections = [
  {
    name: "Starters",
    items: [
      { name: "Pani Puri",         description: "Semolina shells, tamarind water, potato",  price: 120, isVeg: true  },
      { name: "Chicken Tikka",     description: "Tandoor-charred, spiced marinade, mint",   price: 320, isVeg: false },
      { name: "Hara Bhara Kebab",  description: "Tandoor-charred, ajwain marinade, mint",   price: 200, isVeg: true  },
      { name: "Seekh Kebab",       description: "Minced lamb skewers, charcoal smoked",     price: 350, isVeg: false },
      { name: "Dahi Bhalla Chaat", description: "Lentil dumplings, yoghurt, chutneys",      price: 160, isVeg: true  },
      { name: "Amritsari Fish",    description: "Carom-spiced batter, green chutney",       price: 340, isVeg: false },
    ],
  },
  {
    name: "All-Day Dining",
    items: [
      { name: "Eggs Benedict",       description: "Poached eggs, hollandaise, toasted muffin",    price: 380, isVeg: false },
      { name: "Avocado Toast",       description: "Sourdough, smashed avo, feta, chilli flakes",  price: 320, isVeg: true  },
      { name: "Masala Omelette",     description: "Three eggs, onion, tomato, green chilli",      price: 280, isVeg: true  },
      { name: "Pancake Stack",       description: "Buttermilk pancakes, maple syrup, berries",    price: 340, isVeg: true  },
      { name: "Smoked Salmon Bagel", description: "Cream cheese, capers, red onion, dill",        price: 480, isVeg: false },
      { name: "Granola Bowl",        description: "House granola, Greek yoghurt, seasonal fruit",  price: 280, isVeg: true  },
    ],
  },
  {
    name: "Patisserie",
    items: [
      { name: "Croissant",        description: "Butter laminated, served warm, preserve", price: 180, isVeg: true },
      { name: "Pain au Chocolat", description: "Dark chocolate, flaky pastry",            price: 200, isVeg: true },
      { name: "Blueberry Muffin", description: "Fresh blueberries, lemon zest, streusel", price: 160, isVeg: true },
      { name: "Opera Cake",       description: "Coffee buttercream, chocolate ganache",    price: 280, isVeg: true },
    ],
  },
];

const GOLD     = "#d4af6a";
const GOLD_DIM = "#a09070";
const TEXT     = "#ede0c4";
const CARD_BG  = "#f7f3ec";
const CARD_W   = 300;
const GAP      = 24;
const STEP     = CARD_W + GAP;

type Item = { name: string; description: string; price: number; isVeg: boolean };

function LogoCard({ scale, opacity }: { scale: number; opacity: number }) {
  return (
    <div style={{ scrollSnapAlign: "center", flexShrink: 0, width: CARD_W, height: 420, borderRadius: 20, border: `1px solid ${GOLD}55`, backgroundColor: CARD_BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, transform: `scale(${scale})`, opacity }}>
      <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
        <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke={GOLD} strokeWidth="0.8" fill="none" />
        <path d="M14 24V10" stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" />
        <path d="M14 16C14 16 10 13 9 10" stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" />
        <path d="M14 13C14 13 17 11 18.5 8.5" stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" />
      </svg>
      <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, color: GOLD, letterSpacing: "0.15em" }}>KASOORI</span>
      <span style={{ fontFamily: "var(--font-tiro)", fontSize: 10, color: GOLD, opacity: 0.7 }}>कसूरी</span>
    </div>
  );
}

function MenuCard({ section, scale, opacity }: { section: typeof sections[0]; scale: number; opacity: number }) {
  return (
    <div style={{ scrollSnapAlign: "center", flexShrink: 0, width: CARD_W, height: 420, borderRadius: 20, border: `1px solid ${GOLD}55`, backgroundColor: CARD_BG, display: "flex", flexDirection: "column", overflow: "hidden", transform: `scale(${scale})`, opacity }}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "14px 0 10px", borderBottom: `1px solid ${GOLD}33`, flexDirection: "column", gap: 2 }}>
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
          <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z" stroke={GOLD} strokeWidth="0.8" fill="none" />
          <path d="M14 24V10" stroke={GOLD} strokeWidth="0.7" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 9, color: GOLD, letterSpacing: "0.15em" }}>KASOORI</span>
        <span style={{ fontFamily: "var(--font-tiro)", fontSize: 8, color: GOLD, opacity: 0.8 }}>कसूरी</span>
      </div>
      <div style={{ flex: 1, padding: "6px 20px 10px", display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
        {section.items.map((item: Item, i: number) => (
          <div key={i}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, padding: "5px 0" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 11, height: 11, borderRadius: 2, border: `1px solid ${item.isVeg ? "#16a34a" : "#dc2626"}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: item.isVeg ? "#16a34a" : "#dc2626" }} />
                  </div>
                  <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 13, fontWeight: 600, color: "#2a1f0a", lineHeight: 1.2 }}>{item.name}</span>
                </div>
                <p style={{ fontFamily: "var(--font-cormorant)", fontSize: 10, color: "#7a6a4a", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.description}</p>
              </div>
              <span style={{ fontFamily: "var(--font-cormorant)", fontSize: 12, fontWeight: 600, color: GOLD, flexShrink: 0 }}>₹{item.price}</span>
            </div>
            {i < section.items.length - 1 && <div style={{ borderBottom: `1px solid ${GOLD}22` }} />}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CafePage() {
  const trackRef            = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [scales, setScales] = useState<number[]>(() => Array.from({ length: sections.length + 1 }, (_, i) => i === 0 ? 1 : 0.85));
  const [lang, setLang]     = useState<"en" | "hi">("en");
  const totalCards          = sections.length + 1;

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / STEP));
    setScales(Array.from({ length: totalCards }, (_, i) => Math.max(0.85, 1 - Math.min(Math.abs(el.scrollLeft / STEP - i), 1) * 0.15)));
  }, [totalCards]);

  const scrollTo = (index: number) => {
    trackRef.current?.scrollTo({ left: Math.max(0, Math.min(index, totalCards - 1)) * STEP, behavior: "smooth" });
  };

  return (
    <div style={{ width: "100%", height: "100svh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", backgroundColor: "#1c1810" }}>

      {/* ── Header ── */}
      <header style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px 10px", flexShrink: 0 }}>
        <Image src="/english-logo.png" alt="Kasoori" width={500} height={500} style={{ height: 44, width: "auto" }} />
        <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color: GOLD, fontSize: 9 }}>◆</span>
          <span style={{ fontFamily: "var(--font-cinzel)", fontSize: 11, letterSpacing: "0.14em", color: GOLD }}>{lang === "en" ? "Lobby Café Menu" : "लॉबी कैफे मेनू"}</span>
          <span style={{ color: GOLD, fontSize: 9 }}>◆</span>
        </div>
        <div style={{ display: "flex", border: `1px solid ${GOLD}55`, borderRadius: 999, overflow: "hidden", fontSize: 11, fontFamily: "var(--font-cinzel)" }}>
          {(["en", "hi"] as const).map((l) => (
            <div key={l} onClick={() => setLang(l)} style={{ padding: "4px 12px", cursor: "pointer", backgroundColor: lang === l ? `${GOLD}22` : "transparent", color: lang === l ? GOLD : GOLD_DIM, borderRight: l === "en" ? `1px solid ${GOLD}55` : undefined, transition: "all 0.2s" }}>
              {l === "en" ? "english" : "हिंदी"}
            </div>
          ))}
        </div>
      </header>

      {/* ── Section heading ── */}
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", flexShrink: 0, marginBottom: 8 }}>
        <h1 style={{ fontFamily: "var(--font-cinzel)", fontSize: 26, fontWeight: 600, letterSpacing: "0.18em", color: TEXT, textTransform: "uppercase" }}>
          {active === 0 ? sections[0].name : sections[active - 1]?.name ?? sections[0].name}
        </h1>
      </div>

      {/* ── Track ── */}
      <style>{`.c-track::-webkit-scrollbar{display:none}`}</style>
      <div ref={trackRef} className="c-track" onScroll={onScroll} style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", gap: GAP, overflowX: "scroll", scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", width: "100%", flex: 1, padding: `0 calc(50% - ${CARD_W / 2}px)`, cursor: "grab" }}>
        <LogoCard scale={scales[0]} opacity={0.4 + scales[0] * 0.6} />
        {sections.map((section, i) => (
          <MenuCard key={i} section={section} scale={scales[i + 1]} opacity={0.4 + scales[i + 1] * 0.6} />
        ))}
      </div>

      {/* ── Arrows + dots ── */}
      <div style={{ position: "relative", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 20, padding: "12px 0 8px", flexShrink: 0 }}>
        <button onClick={() => scrollTo(active - 1)} disabled={active === 0} style={{ background: "none", border: "none", color: active === 0 ? `${GOLD}33` : GOLD, fontSize: 26, cursor: active === 0 ? "not-allowed" : "pointer", lineHeight: 1, padding: 0 }}>‹</button>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {Array.from({ length: totalCards }).map((_, i) => (
            <button key={i} onClick={() => scrollTo(i)} style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: i === active ? GOLD : `${GOLD}44`, border: "none", cursor: "pointer", padding: 0, outline: i === active ? `2px solid ${GOLD}88` : "none", outlineOffset: 2, transition: "background-color 0.3s", flexShrink: 0 }} />
          ))}
        </div>
        <button onClick={() => scrollTo(active + 1)} disabled={active === totalCards - 1} style={{ background: "none", border: "none", color: active === totalCards - 1 ? `${GOLD}33` : GOLD, fontSize: 26, cursor: active === totalCards - 1 ? "not-allowed" : "pointer", lineHeight: 1, padding: 0 }}>›</button>
      </div>

      <footer style={{ position: "relative", zIndex: 10, textAlign: "center", paddingBottom: 14, flexShrink: 0 }}>
        <p style={{ fontFamily: "var(--font-cinzel)", fontSize: 10, letterSpacing: "0.1em", color: GOLD }}>
          {lang === "en" ? "Please ask your server to place an order" : "ऑर्डर देने के लिए अपने सर्वर से कहें"}
        </p>
      </footer>
    </div>
  );
}