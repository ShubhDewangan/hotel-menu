"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { adminLogin } from "@/lib/actions/auth.actions";
import Image from "next/image";

/* ─── Same dark forest green as sidebar ─────────────── */
const S = {
  bg:     "#0a1a15",
  card:   "#122920",
  border: "rgba(61,214,163,0.12)",
  teal:   "#3dd6a3",
  muted:  "rgba(180,210,195,0.45)",
  input:  {
    bg:     "rgba(61,214,163,0.05)",
    border: "rgba(61,214,163,0.15)",
    focus:  "rgba(201,168,76,0.3)",
    text:   "rgba(240,245,240,0.8)",
    ph:     "rgba(180,210,195,0.25)",
  },
  gold: "linear-gradient(135deg,#b8922e 0%,#e8ca6a 42%,#f5e080 55%,#c9a84c 100%)",
};

const inputBase = [
  "w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none transition-all",
].join(" ");

function LoginForm() {
  const params     = useSearchParams();
  const redirectTo = params.get("redirect") ?? "/admin";

  const [email,      setEmail]  = useState("");
  const [password,   setPass]   = useState("");
  const [secret,     setSecret] = useState("");
  const [showPass,   setShowP]  = useState(false);
  const [showSecret, setShowS]  = useState(false);
  const [loading,    setLoad]   = useState(false);
  const [error,      setError]  = useState("");

  const handleSubmit = async () => {
    if (!email || !password || !secret) return;
    setLoad(true); setError("");
    const res = await adminLogin({ email, password, secretCode: secret, redirectTo });
    if (res?.error) { setError(res.error); setLoad(false); }
  };

  const field = (
    label: string,
    value: string,
    onChange: (v: string) => void,
    opts?: { type?: string; ph?: string; show?: boolean; toggle?: () => void; onEnter?: () => void }
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-[10px] uppercase tracking-[0.18em]" style={{ color: S.muted }}>
        {label}
      </label>
      <div className="relative">
        <input
          type={opts?.type ?? "text"}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") opts?.onEnter?.(); }}
          placeholder={opts?.ph ?? ""}
          className={inputBase + " pr-10"}
          style={{
            background: S.input.bg,
            border: `1px solid ${S.input.border}`,
            color: S.input.text,
          }}
          onFocus={e  => (e.target.style.borderColor = S.input.focus)}
          onBlur={e   => (e.target.style.borderColor = S.input.border)}
        />
        {opts?.toggle && (
          <button
            type="button"
            onClick={opts.toggle}
            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
            style={{ color: S.muted }}
          >
            {opts.show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: S.bg }}>
      {/* Ambient glow */}
      <div
        className="absolute w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(61,214,163,0.06) 0%, transparent 70%)",
          top: "50%", left: "50%", transform: "translate(-50%,-50%)",
        }}
      />

      <div
        className="relative w-full max-w-[380px] rounded-[1.75rem] p-8"
        style={{
          background: S.card,
          border: `1px solid ${S.border}`,
          boxShadow: "0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(61,214,163,0.08)",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(61,214,163,0.08)", border: `1px solid ${S.border}` }}
          >
            <Image src="/english-logo.png" alt="Kasoori" width={42} height={42} className="opacity-90" />
          </div>
          <div className="text-center">
            <p className="text-[18px] font-light" style={{ color: "rgba(240,245,240,0.85)", fontFamily: "var(--font-cormorant)", letterSpacing: "0.06em" }}>
              Kasoori
            </p>
            <p className="text-[10px] tracking-[0.22em] uppercase mt-0.5" style={{ color: S.muted }}>
              Admin Access
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3.5">
          {field("Email", email, setEmail, { type: "email", ph: "admin@kasoori.com" })}
          {field("Password", password, setPass, {
            type: showPass ? "text" : "password", ph: "••••••••",
            show: showPass, toggle: () => setShowP(p => !p),
          })}
          {field("Access Code", secret, setSecret, {
            type: showSecret ? "text" : "password", ph: "••••••",
            show: showSecret, toggle: () => setShowS(s => !s), onEnter: handleSubmit,
          })}
        </div>

        {error && (
          <p
            className="text-[12px] mt-3.5 px-3 py-2 rounded-xl"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.18)", color: "rgba(248,113,113,0.85)" }}
          >
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password || !secret}
          className="w-full mt-5 py-3 rounded-xl text-[13px] font-semibold cursor-pointer disabled:opacity-35 disabled:cursor-not-allowed transition-all hover:brightness-110"
          style={{ background: S.gold, color: "#6b4e10" }}
        >
          {loading
            ? <span className="flex items-center justify-center gap-2"><Loader2 size={14} className="animate-spin" />Signing in…</span>
            : "Sign In"
          }
        </button>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}