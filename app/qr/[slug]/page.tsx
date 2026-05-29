import { redirect }      from "next/navigation";
import { resolveQRSlug } from "@/lib/actions/admin.actions";

interface QRRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function QRRedirectPage({ params }: QRRouteProps) {
  const { slug } = await params;

  try {
    const resolved = await resolveQRSlug(slug);
    if (resolved) {
      const venue = resolved.eventId
        ? `event_${resolved.eventId}`
        : resolved.venueSlug;
      redirect(`/?venue=${venue}`);
    }
  } catch {
    // fallback
  }

  const knownVenues = ["restaurant", "pool", "lobby"];
  const prefix      = slug.split("-")[0] ?? "restaurant";
  const venueSlug   = knownVenues.includes(prefix) ? prefix : "restaurant";

  redirect(`/?venue=${venueSlug}&seat=${slug}`);
}