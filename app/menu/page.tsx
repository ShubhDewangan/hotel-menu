/* eslint-disable react-hooks/error-boundaries */
// /app/menu/page.tsx

import { themeConfigs }          from "@/lib/themeConfig";
import { MenuTheme }             from "@/types/menu";
import MenuPageClient            from "@/components/menu/MenuPageClient";
import VenuePickerPage           from "@/components/menu/VenuePickerPage";
import { resolveMenuForVenue, resolveMenuForEvent } from "@/lib/actions/admin.actions";
import { menuData }              from "@/data/menuData";   // static fallback

export function getMenuUrl(venueSlug: string, seatSlug?: string): string {
  const base = `/menu?venue=${venueSlug}`;
  return seatSlug ? `${base}&seat=${seatSlug}` : base;
}

export function getQRTargetUrl(
  venueSlug: string,
  seatSlug:  string,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
): string {
  return `${baseUrl}/qr/${seatSlug}`;
}

interface MenuPageProps {
  searchParams: Promise<{ venue?: string; seat?: string }>;
}

export default async function MenuPage({ searchParams }: MenuPageProps) {
  const { venue } = await searchParams;

  // No venue param → show picker
  if (!venue) return <VenuePickerPage />;

  const isEventParam = venue.startsWith("event_");
  const eventId      = isEventParam ? venue.replace("event_", "") : null;

  try {
    // ── Dynamic path (Appwrite) ────────────────────────────
    if (isEventParam && eventId) {
      const menuConfig = await resolveMenuForEvent(eventId);
      if (menuConfig) {
        return (
          <MenuPageClient
            menu={menuConfig}
            theme={themeConfigs["event"]}
            venueSlug={venue}
            isEvent={true}
          />
        );
      }
    }

    // Static venue slugs — try Appwrite first
    const resolved = await resolveMenuForVenue(venue);
    if (resolved) {
      const theme: MenuTheme = resolved.isEvent
        ? "event"
        : (venue as MenuTheme) in themeConfigs
          ? (venue as MenuTheme)
          : "restaurant";

      return (
        <MenuPageClient
          menu={resolved.menuConfig}
          theme={themeConfigs[theme]}
          venueSlug={venue}
          isEvent={resolved.isEvent}
        />
      );
    }
  } catch {
    // Appwrite not yet configured — fall through to static fallback
  }

  // ── Static fallback (menuData.ts) ─────────────────────────
  const VENUE_THEME_MAP: Record<string, MenuTheme> = {
    restaurant: "restaurant",
    pool:       "pool",
    lobby:      "lobby",
  };
  const theme      = isEventParam ? "event" : (VENUE_THEME_MAP[venue] ?? "restaurant");
  const menuConfig = menuData.find((m) => m.theme === theme)
                  ?? menuData.find((m) => m.theme === "restaurant")!;

  return (
    <MenuPageClient
      menu={menuConfig}
      theme={themeConfigs[theme]}
      venueSlug={venue}
      isEvent={isEventParam}
    />
  );
}