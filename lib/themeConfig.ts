import { MenuTheme } from "@/types/menu";

// ─────────────────────────────────────────────────────────────
// ThemeConfig
// Every key maps to a specific slot consumed by the menu UI.
// ─────────────────────────────────────────────────────────────
export interface ThemeConfig {
  // Page-level
  bg:           string;   // full-page fallback bg colour
  bgImage:      string;   // absolute public path to background image
  tagLine:      string;   // ◆ diamond colour class
  accentText:   string;   // venue label + footer text colour class
  accentHex:    string;   // raw hex — used in inline gradient styles
  headerText:   string;   // section heading colour
  descText:     string;   // item description muted colour
  badgeBg:      string;   // category tab active pill bg
  logoFilter:   string;   // Tailwind filter classes on the header logo image

  // Card-level
  cardBg:       string;   // card background
  cardBorder:   string;   // card border (includes border-2 or border)
  divider:      string;   // horizontal rule between items
  logoText:     string;   // colour class for SVG / logo tint inside card strip
  bodyText:     string;   // item name colour
  priceText:    string;   // price colour

  // Navigation
  arrowColor:   string;   // ‹ › colour class
  dotActive:    string;   // filled dot
  dotInactive:  string;   // dim dot
}

// ─────────────────────────────────────────────────────────────
// Per-venue theme definitions
// ─────────────────────────────────────────────────────────────
const themes: Record<MenuTheme, ThemeConfig> = {

  // ── Restaurant — light cream card on dark patterned bg ─────
  restaurant: {
    bg:          "bg-[#1a1108]",
    bgImage:     "/image.png",
    tagLine:     "text-[#d4af6a]",
    accentText:  "text-[#d4af6a]",
    accentHex:   "#d4af6a",
    headerText:  "text-[#ede0c4]",
    descText:    "text-[#7a6a4a]",
    badgeBg:     "bg-[#d4af6a]/10",
    logoFilter:  "",                      // no filter — logo reads fine on light card
    cardBg:      "bg-[#f7f3ec]",          // cream — matches cafe test page
    cardBorder:  "border border-[#d4af6a]/33",
    divider:     "border-[#d4af6a]/20",
    logoText:    "text-[#d4af6a]",
    bodyText:    "text-[#2a1f0a]",        // dark text on light card
    priceText:   "text-[#d4af6a]",
    arrowColor:  "text-[#d4af6a]",
    dotActive:   "bg-[#d4af6a]",
    dotInactive: "bg-[#d4af6a]/27",
  },

  // ── Pool — dark translucent card on pool bg ─────────────────
  pool: {
    bg:          "bg-[#0b1e2d]",
    bgImage:     "/bg-texture-pool.png",
    tagLine:     "text-[#d4af6a]",
    accentText:  "text-[#d4af6a]",
    accentHex:   "#d4af6a",
    headerText:  "text-[#ede0c4]",
    descText:    "text-[#7a6a4a]",
    badgeBg:     "bg-[#d4af6a]/10",
    logoFilter:  "brightness-125 saturate-50",
    cardBg:      "bg-[#0e2638cc]",        // dark tinted — matches pool test page
    cardBorder:  "border-2 border-[#ebcb98]",
    divider:     "border-[#d4af6a]/20",
    logoText:    "text-[#d4af6a]",
    bodyText:    "text-[#ede0c4]",        // light text on dark card
    priceText:   "text-[#d4af6a]",
    arrowColor:  "text-[#d4af6a]",
    dotActive:   "bg-[#d4af6a]",
    dotInactive: "bg-[#d4af6a]/27",
  },

  // ── Lobby Café ───────────────────────────────────────────────
  lobby: {
    bg:          "bg-[#1c1810]",
    bgImage:     "/image.png",            // swap for a dedicated lobby bg if available
    tagLine:     "text-[#d4af6a]",
    accentText:  "text-[#d4af6a]",
    accentHex:   "#d4af6a",
    headerText:  "text-[#ede0c4]",
    descText:    "text-[#a09070]",
    badgeBg:     "bg-[#d4af6a]/10",
    logoFilter:  "",
    cardBg:      "bg-[#231e12]",
    cardBorder:  "border border-[#d4af6a]/25",
    divider:     "border-[#d4af6a]/15",
    logoText:    "text-[#d4af6a]",
    bodyText:    "text-[#ede0c4]",
    priceText:   "text-[#d4af6a]",
    arrowColor:  "text-[#d4af6a]",
    dotActive:   "bg-[#d4af6a]",
    dotInactive: "bg-[#d4af6a]/30",
  },

  // ── Event ────────────────────────────────────────────────────
  event: {
    bg:          "bg-[#12111a]",
    bgImage:     "/image.png",            // swap for event bg
    tagLine:     "text-[#b07fd4]",
    accentText:  "text-[#b07fd4]",
    accentHex:   "#b07fd4",
    headerText:  "text-[#e8daf5]",
    descText:    "text-[#8870aa]",
    badgeBg:     "bg-[#b07fd4]/10",
    logoFilter:  "",
    cardBg:      "bg-[#1a1825]",
    cardBorder:  "border border-[#b07fd4]/25",
    divider:     "border-[#b07fd4]/15",
    logoText:    "text-[#b07fd4]",
    bodyText:    "text-[#e8daf5]",
    priceText:   "text-[#b07fd4]",
    arrowColor:  "text-[#b07fd4]",
    dotActive:   "bg-[#b07fd4]",
    dotInactive: "bg-[#b07fd4]/30",
  },
};

export const themeConfigs: Record<MenuTheme, ThemeConfig> = themes;

export function getTheme(key: string): ThemeConfig {
  return themes[key as MenuTheme] ?? themes.restaurant;
}
