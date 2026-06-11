// lib/utils.qr.ts
// Pure utility — no "use server", safe to import anywhere

import { PopularityTier } from "./actions/menu_points.actions";

export function getQRTargetUrl(
  venueSlug: string,
  seatSlug:  string,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
): string {
  return `${baseUrl}/qr/${seatSlug}`;
}

export function getTier(points: number): PopularityTier {
  if (points >= 20) return "chefs_choice";
  if (points >= 10) return "top_pick";
  if (points >= 5)  return "popular";
  return "normal";
}