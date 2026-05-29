/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/error-boundaries */
// /app/page.tsx
import { themeConfigs }          from "@/lib/themeConfig";
import { MenuTheme }             from "@/types/menu";
import MenuPageClient            from "@/components/menu/MenuPageClient";
import VenuePickerPage           from "@/components/menu/VenuePickerPage";
import { resolveMenuForVenue, resolveMenuForEvent } from "@/lib/actions/admin.actions";
import { menuData }              from "@/data/menuData";

interface HomePageProps {
  searchParams: Promise<{ venue?: string; seat?: string }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const { venue } = await searchParams;
  if (!venue) return <VenuePickerPage />;

  const isEventParam = venue.startsWith("event_");
  const eventId      = isEventParam ? venue.replace("event_", "") : null;

  try {
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
    // fallback
  }

  const VENUE_THEME_MAP: Record<string, MenuTheme> = {
    restaurant: "restaurant",
    pool:       "pool",
    lobby:      "lobby",
  };
  const theme      = isEventParam ? "event" : (VENUE_THEME_MAP[venue] ?? "restaurant");
  const menuConfig = menuData.find((m: any) => m.theme === theme)
                  ?? menuData.find((m: any) => m.theme === "restaurant")!;

  return (
    <MenuPageClient
      menu={menuConfig as any}
      theme={themeConfigs[theme]}
      venueSlug={venue}
      isEvent={isEventParam}
    />
  );
}