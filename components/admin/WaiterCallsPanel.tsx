/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
"use client";

import { useEffect, useRef, useState } from "react";
import { Client } from "appwrite";
import { BellRing, X, CheckCheck } from "lucide-react";
import { dismissCall } from "@/lib/actions/waitercalls.actions";

/* ─── shape of a table doc (only fields we need) ─── */
interface TableDoc {
  $id:          string;
  table_number: number;
  venue_name?:  string;   // join this in if your table doc has it, otherwise pass venue map
  is_calling:   boolean;
  called_at?:   string;
}

/* ─── single incoming call notification ──────────── */
interface IncomingCall {
  tableId:      string;
  tableNumber:  number;
  venueName:    string;
  calledAt:     string;
  dismissing:   boolean;
}

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;
const ENDPOINT   = process.env.NEXT_PUBLIC_ENDPOINT!;
const DATABASE_ID      = process.env.NEXT_PUBLIC_DATABASE_ID!;
const TABLES_COL_ID    = process.env.NEXT_PUBLIC_TABLES_COLLECTION_ID!; // needs NEXT_PUBLIC_ for client

/* ═══════════════════════════════════════════════════
   WaiterCallsPanel
   Drop this anywhere in the admin layout — it floats
   as a fixed panel bottom-right and shows live calls.
═══════════════════════════════════════════════════ */
export default function WaiterCallsPanel() {
  const [calls, setCalls]       = useState<IncomingCall[]>([]);
  const [connected, setConn]    = useState(false);
  const audioRef                = useRef<AudioContext | null>(null);

  /* ─── Appwrite Realtime subscription ─────────── */
  useEffect(() => {
    const client = new Client().setEndpoint(ENDPOINT).setProject(PROJECT_ID);

    // Subscribe to all documents in the tables collection
    const channel = `databases.${DATABASE_ID}.collections.${TABLES_COL_ID}.documents`;

    const unsub = client.subscribe(channel, (response) => {
      const payload = response.payload as TableDoc;

      // Only care about updates where is_calling flipped to true
      if (
        response.events.some(e => e.includes("update")) &&
        payload.is_calling === true
      ) {
        playChime();

        setCalls(prev => {
          // avoid duplicate if already in list
          if (prev.some(c => c.tableId === payload.$id)) return prev;
          return [
            {
              tableId:     payload.$id,
              tableNumber: payload.table_number,
              venueName:   payload.venue_name ?? "Venue",
              calledAt:    payload.called_at ?? new Date().toISOString(),
              dismissing:  false,
            },
            ...prev,
          ];
        });
      }

      // If admin already dismissed from another device — remove from list
      if (
        response.events.some(e => e.includes("update")) &&
        payload.is_calling === false
      ) {
        setCalls(prev => prev.filter(c => c.tableId !== payload.$id));
      }
    });

    setConn(true);
    return () => { unsub(); setConn(false); };
  }, []);

  /* ─── Web Audio chime ─────────────────────────── */
  const playChime = () => {
    try {
      const ctx  = new AudioContext();
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type      = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.35, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* silently fail if audio blocked */ }
  };

  /* ─── Dismiss handler ─────────────────────────── */
  const handleDismiss = async (tableId: string) => {
    setCalls(prev => prev.map(c => c.tableId === tableId ? { ...c, dismissing: true } : c));
    await dismissCall(tableId);
    setCalls(prev => prev.filter(c => c.tableId !== tableId));
  };

  /* ─── Nothing active ────────────────────────── */
  if (calls.length === 0) return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px]"
      style={{
        background: "#F9F8F6",
        border: "1px solid #E8E4DC",
        color: "#8a8070",
        boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: connected ? "#22c55e" : "#d1cdc7" }}
      />
      {connected ? "Listening for calls" : "Connecting…"}
    </div>
  );

  /* ─── Active calls panel ────────────────────── */
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 w-[300px]">
      {/* Header pill */}
      <div
        className="flex items-center gap-2 px-3.5 py-2 rounded-full text-[11px] font-semibold self-end"
        style={{
          background: "#111",
          color: "#fff",
          boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
        }}
      >
        <BellRing size={12} strokeWidth={2.5} />
        {calls.length} call{calls.length > 1 ? "s" : ""} incoming
      </div>

      {/* Call cards */}
      {calls.map(call => (
        <CallCard key={call.tableId} call={call} onDismiss={handleDismiss} />
      ))}
    </div>
  );
}

/* ─── Individual call card ─────────────────────── */
function CallCard({
  call,
  onDismiss,
}: {
  call: IncomingCall;
  onDismiss: (id: string) => void;
}) {
  const elapsed = useElapsed(call.calledAt);

  return (
    <div
      className="rounded-2xl p-4 flex items-start gap-3 animate-slide-up"
      style={{
        background: "#FFFFFF",
        border: "1px solid #E8E4DC",
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        opacity: call.dismissing ? 0.5 : 1,
        transition: "opacity 0.2s",
      }}
    >
      {/* Bell pulse */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: "rgba(232,97,10,0.08)", border: "1px solid rgba(232,97,10,0.2)" }}
      >
        <BellRing size={16} strokeWidth={2} color="#E8610A"
          style={{ animation: "bell-shake 0.5s ease infinite alternate" }} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-semibold text-black leading-tight">
          Table {call.tableNumber}
        </p>
        <p className="text-[11px] mt-0.5" style={{ color: "#8a8070" }}>
          {call.venueName} · {elapsed}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(call.tableId)}
        disabled={call.dismissing}
        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 cursor-pointer transition-all hover:scale-110 disabled:opacity-40"
        style={{ background: "#111", color: "#fff" }}
        title="Mark as handled"
      >
        {call.dismissing
          ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          : <CheckCheck size={13} strokeWidth={2.5} />
        }
      </button>
    </div>
  );
}

/* ─── live elapsed time hook ────────────────────── */
function useElapsed(isoStr: string) {
  const [label, setLabel] = useState(toLabel(isoStr));

  useEffect(() => {
    const t = setInterval(() => setLabel(toLabel(isoStr)), 10_000);
    return () => clearInterval(t);
  }, [isoStr]);

  return label;
}

function toLabel(isoStr: string) {
  const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
  if (diff < 60)  return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

/*
  Add to globals.css:

  @keyframes bell-shake {
    0%   { transform: rotate(-12deg); }
    100% { transform: rotate(12deg); }
  }

  @keyframes slide-up {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .animate-slide-up {
    animation: slide-up 0.25s ease;
  }
*/