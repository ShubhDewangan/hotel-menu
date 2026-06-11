"use client";

import { useState } from "react";
import { ChefHat, Flame, TrendingUp, Plus, Minus, Loader2, Image as ImageIcon, X } from "lucide-react";
import { adjustItemPoints, getTier, type PopularityTier } from "@/lib/actions/menu_points.actions";

/* ─── Palette (matches dashboard light theme) ────────── */
const GOLD       = "linear-gradient(135deg,#b8922e 0%,#e8ca6a 40%,#f0d878 55%,#c9a84c 100%)";
const GOLD_TEXT  = "#7a5a10";
const ORANGE     = "#E8610A";
const BORDER     = "#E8E4DC";
const MUTED      = "#8a8070";
const CARD_BG    = "#FFFFFF";

export type PopularityTier2 = PopularityTier;

const TIER_CONFIG = {
  chefs_choice: { label: "Chef's Choice", icon: ChefHat,   style: { background: GOLD, color: GOLD_TEXT } },
  top_pick:     { label: "Top Pick",      icon: Flame,     style: { background: "#fff1ea", color: ORANGE, border: `1px solid ${ORANGE}33` } },
  popular:      { label: "Popular",       icon: TrendingUp,style: { background: "#c8f0d8", color: "#1a4d2e", border: "1px solid #a3e4b8" } },
  normal:       { label: "",              icon: null,      style: {} },
} as const;

interface MenuItemRowProps {
  item: {
    $id: string;
    name: string;
    description?: string;
    price: number;
    is_available: boolean;
    popularity_points: number;
    image_url?: string;
  };
  accent: string;
  onDelete: (id: string) => void;
  onImageUpdate?: (id: string, url: string) => void;
}

export function MenuItemRow({ item, accent, onDelete, onImageUpdate }: MenuItemRowProps) {
  const [points, setPoints]       = useState(item.popularity_points ?? 0);
  const [busy, setBusy]           = useState(false);
  const [imageUrl, setImageUrl]   = useState(item.image_url ?? "");
  const [editingImg, setEditImg]  = useState(false);
  const [imgInput, setImgInput]   = useState(item.image_url ?? "");

  const tier    = getTier(points);
  const tierCfg = TIER_CONFIG[tier];

  const adjust = async (delta: 1 | -1) => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await adjustItemPoints(item.$id, delta, points);
      setPoints(res.points);
    } finally {
      setBusy(false);
    }
  };

  const saveImage = () => {
    setImageUrl(imgInput);
    setEditImg(false);
    onImageUpdate?.(item.$id, imgInput);
    // TODO: call updateMenuItem server action with image_url: imgInput
  };

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{ background: CARD_BG, border: `1px solid ${BORDER}` }}
    >
      {/* ── Image thumbnail / upload ── */}
      <div className="flex-shrink-0 relative group">
        <div
          className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer transition-all"
          style={{ background: "#f5f2ed", border: `1px solid ${accent}22` }}
          onClick={() => setEditImg(true)}
        >
          {imageUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon size={14} color="#fff" />
              </div>
            </>
          ) : (
            <ImageIcon size={16} strokeWidth={1.5} color={MUTED} />
          )}
        </div>
      </div>

      {/* ── Image URL edit inline ── */}
      {editingImg && (
        <div
          className="absolute z-20 mt-1 rounded-xl p-3 shadow-xl flex items-center gap-2"
          style={{ background: CARD_BG, border: `1px solid ${BORDER}`, width: "280px" }}
        >
          <input
            autoFocus
            value={imgInput}
            onChange={(e) => setImgInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveImage(); if (e.key === "Escape") setEditImg(false); }}
            placeholder="Image URL…"
            className="flex-1 text-[12px] outline-none px-2 py-1 rounded-lg"
            style={{ background: "#f5f2ed", border: `1px solid ${BORDER}`, color: "#111" }}
          />
          <button
            onClick={saveImage}
            className="px-2 py-1 rounded-lg text-[11px] font-semibold text-white cursor-pointer"
            style={{ background: "#111" }}
          >
            Save
          </button>
          <button onClick={() => setEditImg(false)} style={{ color: MUTED }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* ── Name + description ── */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13px] font-medium text-black">{item.name}</span>

          {/* Tier badge */}
          {tier !== "normal" && (
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold"
              style={tierCfg.style as React.CSSProperties}
            >
              {tierCfg.icon && <tierCfg.icon size={8} strokeWidth={2.5} />}
              {tierCfg.label}
            </span>
          )}
        </div>
        {item.description && (
          <p className="text-[11px] truncate mt-0.5" style={{ color: MUTED }}>{item.description}</p>
        )}
      </div>

      {/* ── Price ── */}
      <span className="text-[13px] font-semibold text-black flex-shrink-0">₹{item.price}</span>

      {/* ── Points control ── */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button
          onClick={() => adjust(-1)}
          disabled={busy || points === 0}
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer disabled:opacity-30 transition-all"
          style={{ border: `1px solid ${BORDER}`, background: CARD_BG }}
        >
          <Minus size={9} strokeWidth={2.5} color="#111" />
        </button>

        <span
          className="w-5 text-center text-[12px] font-semibold tabular-nums"
          style={{ color: points > 0 ? ORANGE : MUTED }}
        >
          {points}
        </span>

        <button
          onClick={() => adjust(1)}
          disabled={busy}
          className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-all"
          style={{ background: "#111", color: "#fff" }}
        >
          {busy
            ? <Loader2 size={9} className="animate-spin" />
            : <Plus size={9} strokeWidth={2.5} />}
        </button>
      </div>

      {/* ── Active dot ── */}
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: item.is_available ? "#22c55e" : "#d1cdc7" }}
      />

      {/* ── Delete ── */}
      <button
        onClick={() => onDelete(item.$id)}
        className="p-1.5 rounded-lg cursor-pointer transition-all flex-shrink-0"
        style={{ color: "#d1cdc7" }}
        onMouseEnter={e => (e.currentTarget.style.color = "#ef4444")}
        onMouseLeave={e => (e.currentTarget.style.color = "#d1cdc7")}
      >
        <X size={13} />
      </button>
    </div>
  );
}