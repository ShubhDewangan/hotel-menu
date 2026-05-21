"use client";

interface VenueQRCardProps {
  name: string;
  area: string;
  tag: string;
  accentColor: string;
  qrImageUrl?: string;
}

export default function VenueQRCard({
  name,
  area,
  tag,
  accentColor,
  qrImageUrl,
}: VenueQRCardProps) {
  return (
    <div className="flex flex-col items-center gap-3 bg-white/[0.04] border border-[#c9a84c]/20 min-w-55 min-h-70 rounded-2xl p-4 hover:border-[#c9a84c]/45 transition-colors duration-200">

      {/* QR frame */}
      <div className="w-[90px] h-[90px] bg-[#f5f0e8] rounded-xl flex items-center justify-center relative p-2">
        {qrImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={qrImageUrl}
            alt={`${name} QR code`}
            className="w-full h-full object-contain"
          />
        ) : (
          <svg viewBox="0 0 60 60" className="w-full h-full opacity-85" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="2" width="22" height="22" rx="2" fill="none" stroke={accentColor} strokeWidth="2" />
            <rect x="6" y="6" width="14" height="14" rx="1" fill={accentColor} />
            <rect x="36" y="2" width="22" height="22" rx="2" fill="none" stroke={accentColor} strokeWidth="2" />
            <rect x="40" y="6" width="14" height="14" rx="1" fill={accentColor} />
            <rect x="2" y="36" width="22" height="22" rx="2" fill="none" stroke={accentColor} strokeWidth="2" />
            <rect x="6" y="40" width="14" height="14" rx="1" fill={accentColor} />
            <rect x="30" y="30" width="4" height="4" fill={accentColor} />
            <rect x="36" y="30" width="4" height="4" fill={accentColor} />
            <rect x="42" y="30" width="4" height="4" fill={accentColor} />
            <rect x="50" y="30" width="8" height="4" fill={accentColor} />
            <rect x="30" y="36" width="4" height="4" fill={accentColor} />
            <rect x="42" y="36" width="4" height="4" fill={accentColor} />
            <rect x="30" y="42" width="8" height="4" fill={accentColor} />
            <rect x="42" y="42" width="4" height="4" fill={accentColor} />
            <rect x="50" y="42" width="8" height="4" fill={accentColor} />
            <rect x="30" y="48" width="4" height="4" fill={accentColor} />
            <rect x="36" y="48" width="8" height="4" fill={accentColor} />
            <rect x="50" y="48" width="8" height="4" fill={accentColor} />
          </svg>
        )}

        {/* Kasoori logo dot overlay */}
        <div className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center border border-white/20"
            style={{ background: accentColor }}
          >
            <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z"
                stroke="#c9a84c"
                strokeWidth="1"
                fill="none"
              />
              <path d="M14 24V10" stroke="#c9a84c" strokeWidth="0.8" strokeLinecap="round" />
            </svg>
          </div>
        </div>
      </div>

      {/* Labels */}
      <div className="flex flex-col items-center gap-1">
        <span
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.1em" }}
          className="text-[12px] text-[#e8d59a] text-center"
        >
          {name}
        </span>
        <span
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-[11px] italic text-[#c9a84c]/50 text-center"
        >
          {area}
        </span>
        <span
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.06em" }}
          className="text-[9px] px-2.5 py-0.5 rounded-full bg-[#c9a84c]/10 border border-[#c9a84c]/25 text-[#c9a84c]/80 mt-0.5"
        >
          {tag}
        </span>
      </div>
    </div>
  );
}