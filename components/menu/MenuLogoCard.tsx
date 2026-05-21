"use client";

import Image from "next/image";
import { ThemeConfig } from "@/lib/themeConfig";

interface MenuLogoCardProps {
  scale:       number;
  opacity:     number;
  cardWidth:   number;
  cardHeight:  number;
  theme:       ThemeConfig;
}

export default function MenuLogoCard({
  scale,
  opacity,
  cardWidth,
  cardHeight,
  theme,
}: MenuLogoCardProps) {
  return (
    <div
      // Uses the same card bg as MenuSectionCard so the logo card
      // feels like part of the same deck.
      className={`flex-shrink-0 rounded-[20px] flex flex-col items-center justify-center gap-3 ${theme.cardBg}`}
      style={{
        scrollSnapAlign: "center",
        width:     cardWidth,
        height:    cardHeight,
        transform: `scale(${scale})`,
        opacity,
        // Pool card bg is a CSS colour with alpha — needs backdrop-filter
        // for the blur effect seen in the pool test page.
        backdropFilter: "blur(8px)",
        // Replicate the border exactly as the section cards use it
        // (border class lives in theme.cardBorder which includes "border"
        // keyword — we can't spread it here, so we mirror with outline).
      }}
    >
      <Image
        src="/image-Photoroom.png"
        alt="Kasoori logo mark"
        width={80}
        height={80}
        className={`h-20 w-auto ${theme.logoFilter}`}
      />
      <Image
        src="/double-text-logo.png"
        alt="Kasoori"
        width={160}
        height={64}
        className={`h-16 w-auto ${theme.logoFilter}`}
      />
    </div>
  );
}