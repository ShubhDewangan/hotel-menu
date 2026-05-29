/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Image from "next/image";
import { MenuCategory } from "@/types/menu";
import { ThemeConfig }  from "@/lib/themeConfig";
import { useCart }      from "@/context/CartContext";

interface MenuSectionCardProps {
  section:     MenuCategory;
  scale:       number;
  opacity:     number;
  cardWidth:   number;
  cardHeight:  number;
  theme:       ThemeConfig;
  searchQuery?: string;
}

function highlight(text: string, query: string, accentHex: string): React.ReactNode {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark style={{ background: `${accentHex}55`, color: "inherit", borderRadius: "2px", padding: "0 2px" }}>
        {text.slice(idx, idx + query.length)}
      </mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export default function MenuSectionCard({
  section,
  scale,
  opacity,
  cardWidth,
  cardHeight,
  theme,
  searchQuery = "",
}: MenuSectionCardProps) {
  const { addItem, items } = useCart();

  const q = searchQuery.trim().toLowerCase();

  // Determine which items match the search
  const itemsWithMatch = section.items.map((item) => {
    const matches =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false);
    return { item, matches };
  });

  const anyMatch = !q || itemsWithMatch.some((i) => i.matches);

  return (
    <div
      className={`flex-shrink-0 rounded-[20px] flex flex-col overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}
      style={{
        scrollSnapAlign: "center",
        width:           cardWidth,
        height:          cardHeight,
        transform:       `scale(${scale})`,
        opacity:         !anyMatch ? opacity * 0.35 : opacity,
        backdropFilter:  "blur(8px)",
        transition:      "opacity 0.2s ease",
      }}
    >
      {/* Card header — logo strip */}
      <div className={`flex flex-col items-center justify-center py-[14px] border-b ${theme.divider} gap-0.5`}>
        <Image
          src="/image-Photoroom.png"
          alt="Kasoori logo mark"
          width={64}
          height={64}
          className={`h-16 w-auto ${theme.logoFilter}`}
        />
        <Image
          src="/double-text-logo.png"
          alt="Kasoori"
          width={120}
          height={40}
          className={`h-10 w-auto ${theme.logoFilter}`}
        />
      </div>

      {/* Items */}
      <div className="flex-1 px-5 py-2 flex flex-col justify-evenly">
        {itemsWithMatch.map(({ item, matches }, i) => {
          const inCart = items.find((c: any) => c.name === item.name);
          return (
            <div key={i}>
              <div
                onClick={() => addItem({
                  name:        item.name,
                  description: item.description ?? "",
                  price:       item.price,
                  isVeg:       item.isVeg,
                })}
                className="flex justify-between items-start gap-2 py-[5px] cursor-pointer rounded-[6px] hover:bg-black/5 active:scale-[0.98] transition-all duration-100 px-1 -mx-1"
                style={{ opacity: q && !matches ? 0.2 : 1, transition: "opacity 0.15s ease" }}
              >
                {/* Left */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-[5px]">
                    <div
                      className={`w-[11px] h-[11px] rounded-[2px] border flex items-center justify-center flex-shrink-0 ${
                        item.isVeg ? "border-green-600" : "border-red-600"
                      }`}
                    >
                      <div className={`w-[5px] h-[5px] rounded-full ${item.isVeg ? "bg-green-600" : "bg-red-600"}`} />
                    </div>
                    <span className={`font-cormorant text-[13px] font-semibold leading-tight ${theme.bodyText}`}>
                      {highlight(item.name, searchQuery, theme.accentHex)}
                    </span>
                    {inCart && (
                      <span
                        className="ml-1 px-1.5 py-0 rounded-full font-cinzel text-[9px] font-bold text-black"
                        style={{ background: theme.accentHex }}
                      >
                        {inCart.quantity}×
                      </span>
                    )}
                  </div>
                  <p className={`font-cormorant text-[10px] mt-0.5 truncate ${theme.descText}`}>
                    {highlight(item.description ?? "", searchQuery, theme.accentHex)}
                  </p>
                </div>

                {/* Price */}
                <span className={`font-cormorant text-[12px] font-semibold flex-shrink-0 ${theme.priceText}`}>
                  ₹{item.price}
                </span>
              </div>

              {i < section.items.length - 1 && (
                <div className={`border-b ${theme.divider}`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}