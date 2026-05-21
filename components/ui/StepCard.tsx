"use client";

interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

export default function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="flex flex-col bg-white/[0.04] border border-[#c9a84c]/20 rounded-2xl p-5 max-w-[340px] backdrop-blur-sm min-h-[100px]">
      {/* Number badge top-left */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full border border-[#c9a84c]/40 bg-[#c9a84c]/10 flex items-center justify-center shrink-0">
          <span
            style={{ fontFamily: "'Cinzel', serif" }}
            className="text-[10px] text-[#c9a84c]"
          >
            {number}
          </span>
        </div>
        <span
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.07em" }}
          className="text-[15px] text-[#e8d59a] leading-tight"
        >
          {title}
        </span>
      </div>

      {/* Description */}
      <span
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
        className="text-[16px] italic text-[#c8b98a]/65 leading-snug flex-1"
      >
        {description}
      </span>

      {/* Icon bottom-left */}
    </div>
  );
}