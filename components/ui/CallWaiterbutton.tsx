"use client";

import { useState } from "react";
import { BellRing, Check, Loader2 } from "lucide-react";
import { callWaiter } from "@/lib/actions/waitercalls.actions";

interface Props {
  tableId:     string;
  tableNumber: number;
}

const COOLDOWN_MS = 3 * 60 * 1000; // 3 min — prevent spam

export default function CallWaiterButton({ tableId, tableNumber }: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "cooldown">("idle");
  const [secsLeft, setSecs]  = useState(0);

  const handleCall = async () => {
    if (status !== "idle") return;
    setStatus("loading");

    try {
      await callWaiter(tableId);
      setStatus("sent");

      setTimeout(() => {
        setStatus("cooldown");
        let s = COOLDOWN_MS / 1000;
        setSecs(s);
        const t = setInterval(() => {
          s -= 1;
          setSecs(s);
          if (s <= 0) { clearInterval(t); setStatus("idle"); }
        }, 1000);
      }, 2500);
    } catch {
      setStatus("idle");
    }
  };

  const cfg = {
    idle:     { label: "Call Waiter",       icon: <BellRing size={16} strokeWidth={2} />,          color: "#c9a84c",               border: "rgba(201,168,76,0.35)",  bg: "rgba(201,168,76,0.08)"  },
    loading:  { label: "Calling…",          icon: <Loader2  size={16} className="animate-spin" />, color: "rgba(201,168,76,0.5)",  border: "rgba(201,168,76,0.15)",  bg: "rgba(201,168,76,0.04)"  },
    sent:     { label: "Waiter is on way!", icon: <Check    size={16} strokeWidth={2.5} />,        color: "#22c55e",               border: "rgba(34,197,94,0.35)",   bg: "rgba(34,197,94,0.08)"   },
    cooldown: { label: `Wait ${secsLeft}s`, icon: <BellRing size={16} strokeWidth={1.5} />,        color: "rgba(255,255,255,0.18)",border: "rgba(255,255,255,0.08)", bg: "transparent"            },
  }[status];

  return (
    <button
      onClick={handleCall}
      disabled={status === "loading" || status === "cooldown"}
      className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl text-[13px] font-medium transition-all duration-300 cursor-pointer disabled:cursor-not-allowed select-none"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}
    >
      {cfg.icon}
      {cfg.label}
    </button>
  );
}