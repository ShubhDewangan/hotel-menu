"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/actions/auth.actions";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode]         = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async () => {
  if (!email || !password || !code) {
    setError("All fields are required.");
    return;
  }
  setLoading(true);
  setError("");

  const result = await adminLogin({ email, password, code });

  if (result.success) {
  window.location.replace("/admin/venues");
} else {
    setError(result.error ?? "Login failed.");
    console.log('hello')
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-[#080a10] flex items-center justify-center relative overflow-hidden">

      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, #c9a84c08 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-10">
          <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
            <path d="M14 3C14 3 6 8 6 16C6 20.4 9.6 24 14 24C18.4 24 22 20.4 22 16C22 8 14 3 14 3Z"
              stroke="#c9a84c" strokeWidth="0.8" fill="none" />
            <path d="M14 24V10" stroke="#c9a84c" strokeWidth="0.7" strokeLinecap="round" />
          </svg>
          <div className="text-center">
            <p className="text-[#c9a84c] text-[13px] tracking-[0.2em]"
              style={{ fontFamily: "var(--font-cinzel)" }}>
              KASOORI
            </p>
            <p className="text-white/30 text-[11px] mt-0.5"
              style={{ fontFamily: "var(--font-cinzel)" }}>
              Admin Panel
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
          <h1 className="text-[15px] text-white mb-1"
            style={{ fontFamily: "var(--font-cinzel)", letterSpacing: "0.08em" }}>
            Sign In
          </h1>
          <p className="text-[12px] text-white/30 mb-6">
            Enter your credentials to access the admin panel
          </p>

          <div className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@kasoori.com"
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors"
              />
            </div>

            {/* Secret code */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] text-white/40">Secret Code</label>
              <input
                type="password"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                className="bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-[13px] text-white placeholder-white/20 outline-none focus:border-[#c9a84c]/40 transition-colors"
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-[#c9a84c]/15 hover:bg-[#c9a84c]/25 border border-[#c9a84c]/30 text-[#e8d59a] text-[13px] py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 mt-1"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign In"}
            </button>
          </div>
        </div>

        <p className="text-center text-[10px] text-white/15 mt-6"
          style={{ fontFamily: "var(--font-cinzel)" }}>
          Kasoori Methi © 2025
        </p>
      </div>
    </div>
  );
}