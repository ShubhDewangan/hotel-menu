// /app/qr/[slug]/page.tsx

import { redirect }      from "next/navigation";
import { resolveQRSlug } from "@/lib/actions/admin.actions";

interface QRRouteProps {
  params: Promise<{ slug: string }>;
}

export default async function QRRedirectPage({ params }: QRRouteProps) {
  const { slug } = await params;

  try {
    // ── Dynamic path (Appwrite) ──────────────────────────────
    const resolved = await resolveQRSlug(slug);
    if (resolved) {
      const venue = resolved.eventId
        ? `event_${resolved.eventId}`
        : resolved.venueSlug;
      redirect(`/menu?venue=${venue}&seat=${resolved.seatId}`);
    }
  } catch {
    // Appwrite not yet configured — fall through to dev fallback
  }

  // ── Dev fallback: derive venue from slug prefix ────────────
  // e.g. "restaurant-t1-s2-x7k4p" → restaurant
  const knownVenues = ["restaurant", "pool", "lobby"];
  const prefix      = slug.split("-")[0] ?? "restaurant";
  const venueSlug   = knownVenues.includes(prefix) ? prefix : "restaurant";

  redirect(`/menu?venue=${venueSlug}&seat=${slug}`);
}