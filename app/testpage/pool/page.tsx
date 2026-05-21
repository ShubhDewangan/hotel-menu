"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import LanguageButton from "@/components/ui/LanguageButton";

const sections = [
  {
    name: "Starters",
    items: [
      { name: "Corn Cheese Toast", description: "Sourdough, sweet corn, cheddar, herbs",      price: 220, isVeg: true  },
      { name: "Grilled Calamari",  description: "Lemon butter, parsley, aioli",               price: 380, isVeg: false },
      { name: "Nachos Grande",     description: "Tortilla, jalapeños, guacamole, sour cream", price: 320, isVeg: true  },
      { name: "Chicken Wings",     description: "Buffalo sauce, blue cheese dip, celery",     price: 420, isVeg: false },
      { name: "Spring Rolls",      description: "Vegetables, glass noodles, sweet chilli",    price: 260, isVeg: true  },
      { name: "Prawn Cocktail",    description: "Tiger prawns, Marie Rose, iceberg",          price: 450, isVeg: false },
    ],
  },
  {
    name: "Mains",
    items: [
      { name: "Club Sandwich",     description: "Triple decker, chicken, bacon, egg, fries", price: 480, isVeg: false },
      { name: "Veggie Burger",     description: "Beetroot patty, lettuce, sriracha mayo",    price: 380, isVeg: true  },
      { name: "Fish & Chips",      description: "Beer-battered sole, mushy peas, tartar",    price: 520, isVeg: false },
      { name: "Caesar Salad",      description: "Romaine, parmesan, croutons, anchovies",    price: 360, isVeg: false },
      { name: "Margherita Pizza",  description: "San Marzano, buffalo mozzarella, basil",    price: 420, isVeg: true  },
      { name: "BBQ Chicken Pizza", description: "Smoky BBQ, mozzarella, red onion",          price: 480, isVeg: false },
    ],
  },
  {
    name: "Beverages",
    items: [
      { name: "Fresh Lime Soda", description: "Squeezed lime, soda, mint, black salt", price: 120, isVeg: true },
      { name: "Mango Lassi",     description: "Alphonso mango, yoghurt, cardamom",      price: 180, isVeg: true },
      { name: "Iced Americano",  description: "Double espresso, filtered water, ice",   price: 200, isVeg: true },
      { name: "Coconut Water",   description: "Fresh tender coconut, served chilled",   price: 150, isVeg: true },
    ],
  },
];

const CARD_W = 500;
const GAP    = 24;
const STEP   = CARD_W + GAP;

type Item = { name: string; description: string; price: number; isVeg: boolean };

function LogoCard({ scale, opacity }: { scale: number; opacity: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-[20px] border border-[#d4af6a]/33 bg-[#0e2638cc] backdrop-blur-[8px] flex flex-col items-center justify-center gap-2"
      style={{
        scrollSnapAlign: "center",
        width: CARD_W,
        height: 420,
        transform: `scale(${scale})`,
        opacity,
      }}
    >
      <Image src={'/image-Photoroom.png'} alt='logo' height={40} width={40} className="h-20 w-auto brightness-125 saturate-50" />
      <Image src={'/double-text-logo.png'} alt='logo' height={40} width={40} className="h-16 w-auto brightness-125 saturate-50" />
    </div>
  );
}

function MenuCard({ section, scale, opacity }: { section: typeof sections[0]; scale: number; opacity: number }) {
  return (
    <div
      className="flex-shrink-0 rounded-[20px] border-2 border-[#ebcb98] bg-[#0e2638cc] backdrop-blur-[8px] flex flex-col overflow-hidden h-[600px] w-[500px]"
      style={{ scrollSnapAlign: "center", transform: `scale(${scale})`, opacity }}
    >
      {/* Card header */}
      <div className="flex flex-col items-center justify-center py-[14px] border-b border-[#d4af6a]/20 gap-0.5">
        <Image src={'/image-Photoroom.png'} alt='logo' height={40} width={40} className="h-16 w-auto brightness-125 saturate-50" />
        <Image src={'/double-text-logo.png'} alt='logo' height={40} width={40} className="h-10 w-auto brightness-125 saturate-50" />
      </div>

      {/* Items */}
      <div className="flex-1 px-5 py-2 flex flex-col justify-evenly">
        {section.items.map((item: Item, i: number) => (
          <div key={i}>
            <div className="flex justify-between items-start gap-2 py-[5px]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[5px]">
                  <div
                    className={`w-[11px] h-[11px] rounded-[2px] border flex items-center justify-center flex-shrink-0 ${
                      item.isVeg ? "border-green-600" : "border-red-600"
                    }`}
                  >
                    <div className={`w-[5px] h-[5px] rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
                  </div>
                  {/* Item name — light text readable on dark card */}
                  <span className="font-cormorant text-[13px] font-semibold text-[#ede0c4] leading-tight">
                    {item.name}
                  </span>
                </div>
                <p className="font-cormorant text-[10px] text-[#7a6a4a] mt-0.5 truncate">
                  {item.description}
                </p>
              </div>
              {/* Price */}
              <span className="font-cormorant text-[12px] font-semibold text-[#d4af6a] flex-shrink-0">
                ₹{item.price}
              </span>
            </div>
            {i < section.items.length - 1 && (
              <div className="border-b border-[#d4af6a]/13" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function PoolPage() {
  const trackRef            = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [scales, setScales] = useState<number[]>(() =>
    Array.from({ length: sections.length + 1 }, (_, i) => (i === 0 ? 1 : 0.85))
  );
  const totalCards = sections.length + 1;

  const onScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / STEP));
    setScales(
      Array.from({ length: totalCards }, (_, i) =>
        Math.max(0.85, 1 - Math.min(Math.abs(el.scrollLeft / STEP - i), 1) * 0.15)
      )
    );
  }, [totalCards]);

  const scrollTo = (index: number) => {
    trackRef.current?.scrollTo({
      left: Math.max(0, Math.min(index, totalCards - 1)) * STEP,
      behavior: "smooth",
    });
  };

  const activeSection = active === 0
    ? sections[0].name
    : sections[active - 1]?.name ?? sections[0].name;

  return (
    <div className="w-full h-svh flex flex-col relative overflow-hidden">

      {/* Background */}
      <Image
        src="/bg-texture-pool.png"
        alt="bg"
        height={5000}
        width={5000}
        className="h-[110vh] -translate-y-10 w-[120vw] -z-10 absolute object-cover"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-[18px] pb-[10px] flex-shrink-0">
        <Image
          src="/english-logo.png"
          alt="Kasoori"
          width={500}
          height={500}
          className="h-[100px] w-auto brightness-125 saturate-50"
        />
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 whitespace-nowrap min-w-[300px]">
          <div className="flex-1 h-[2px] w-[120px]" style={{ background: "linear-gradient(to left, #d4af6a, transparent)" }} />
          <span className="text-[#d4af6a] text-[11px]">◆</span>
          <span className="font-cinzel text-[16px] tracking-[0.18em] text-[#d4af6a] uppercase">
            Pool Menu
          </span>
          <span className="text-[#d4af6a] text-[11px]">◆</span>
          <div className="flex-1 h-[2px] w-[120px]" style={{ background: "linear-gradient(to right, #d4af6a, transparent)" }} />
        </div>
        <LanguageButton />
      </header>

      {/* Section heading — font-yatra like restaurant page */}
      <div className="relative z-10 text-center flex-shrink-0 mb-2">
        <h1 className="font-yatra text-[26px] font-semibold tracking-[0.05em] text-[#ede0c4] uppercase">
          {activeSection}
        </h1>
      </div>

      {/* Scrollable track */}
      <style>{`.p-track::-webkit-scrollbar{display:none}`}</style>
      <div
        ref={trackRef}
        className="p-track relative z-10 flex items-center overflow-x-scroll flex-1 cursor-grab"
        onScroll={onScroll}
        style={{
          gap: GAP,
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          padding: `0 calc(50% - ${CARD_W / 2}px)`,
        }}
      >
        <LogoCard scale={scales[0]} opacity={0.4 + scales[0] * 0.6} />
        {sections.map((section, i) => (
          <MenuCard
            key={i}
            section={section}
            scale={scales[i + 1]}
            opacity={0.4 + scales[i + 1] * 0.6}
          />
        ))}
      </div>

      {/* Arrows + dots */}
      <div className="relative z-10 flex items-center justify-center gap-5 py-3 flex-shrink-0">
        <button
          onClick={() => scrollTo(active - 1)}
          disabled={active === 0}
          className={`bg-transparent border-none text-[26px] leading-none p-0 transition-colors ${
            active === 0 ? "text-[#d4af6a]/20 cursor-not-allowed" : "text-[#d4af6a] cursor-pointer"
          }`}
        >
          ‹
        </button>

        <div className="flex gap-2 items-center">
          {Array.from({ length: totalCards }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={`w-2 h-2 rounded-full border-none p-0 flex-shrink-0 cursor-pointer transition-all duration-300 ${
                i === active
                  ? "bg-[#d4af6a] outline outline-2 outline-offset-2 outline-[#d4af6a]/50"
                  : "bg-[#d4af6a]/27"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => scrollTo(active + 1)}
          disabled={active === totalCards - 1}
          className={`bg-transparent border-none text-[26px] leading-none p-0 transition-colors ${
            active === totalCards - 1
              ? "text-[#d4af6a]/20 cursor-not-allowed"
              : "text-[#d4af6a] cursor-pointer"
          }`}
        >
          ›
        </button>
      </div>

      {/* Footer */}
      <footer className="relative z-10 text-center pb-[14px] flex-shrink-0">
        <p className="font-cinzel text-[10px] tracking-[0.1em] text-[#d4af6a]">
          Please ask your server to place an order
        </p>
      </footer>
    </div>
  );
}