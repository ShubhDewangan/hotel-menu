"use client";

import Image from "next/image";
import { MenuCategory } from "@/types/menu";
import { ThemeConfig }  from "@/lib/themeConfig";

interface MenuSectionCardProps {
  section:    MenuCategory;
  scale:      number;
  opacity:    number;
  cardWidth:  number;
  cardHeight: number;
  theme:      ThemeConfig;
}

export default function MenuSectionCard({
  section,
  scale,
  opacity,
  cardWidth,
  cardHeight,
  theme,
}: MenuSectionCardProps) {
  return (
    <div
      className={`flex-shrink-0 rounded-[20px] flex flex-col overflow-hidden ${theme.cardBg} ${theme.cardBorder}`}
      style={{
        scrollSnapAlign: "center",
        width:          cardWidth,
        height:         cardHeight,
        transform:      `scale(${scale})`,
        opacity,
        backdropFilter: "blur(8px)",
      }}
    >
      {/* ── Card header — logo strip ── */}
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

      {/* ── Items ── */}
      <div className="flex-1 px-5 py-2 flex flex-col justify-evenly">
        {section.items.map((item, i) => (
          <div key={i}>
            <div className="flex justify-between items-start gap-2 py-[5px]">
              {/* Left: veg dot + name + description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-[5px]">
                  {/* Indian veg / non-veg indicator */}
                  <div
                    className={`w-[11px] h-[11px] rounded-[2px] border flex items-center justify-center flex-shrink-0 ${
                      item.isVeg ? "border-green-600" : "border-red-600"
                    }`}
                  >
                    <div
                      className={`w-[5px] h-[5px] rounded-full ${
                        item.isVeg ? "bg-green-600" : "bg-red-600"
                      }`}
                    />
                  </div>
                  <span
                    className={`font-cormorant text-[13px] font-semibold leading-tight ${theme.bodyText}`}
                  >
                    {item.name}
                  </span>
                </div>
                <p className={`font-cormorant text-[10px] mt-0.5 truncate ${theme.descText}`}>
                  {item.description}
                </p>
              </div>

              {/* Price */}
              <span className={`font-cormorant text-[12px] font-semibold flex-shrink-0 ${theme.priceText}`}>
                ₹{item.price}
              </span>
            </div>

            {/* Divider between items */}
            {i < section.items.length - 1 && (
              <div className={`border-b ${theme.divider}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}