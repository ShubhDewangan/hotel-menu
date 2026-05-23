// lib/utils.qr.ts
// Pure utility — no "use server", safe to import anywhere

export function getQRTargetUrl(
  venueSlug: string,
  seatSlug:  string,
  baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
): string {
  return `${baseUrl}/qr/${seatSlug}`;
}