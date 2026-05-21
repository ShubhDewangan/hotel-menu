"use client";

import { createContext, useContext, useState } from "react";

// ── Context ───────────────────────────────────────────────────
export type Language = "en" | "hi";

export const LanguageContext = createContext<{
  lang:    Language;
  setLang: (l: Language) => void;
}>({ lang: "en", setLang: () => {} });

export function useLanguage() {
  return useContext(LanguageContext);
}

// ── Toggle pill ───────────────────────────────────────────────
export default function LanguageButton() {
  const { lang, setLang } = useLanguage();

  return (
    <div className="relative flex h-8 w-[130px] z-10 items-center rounded-full p-0.5 border border-amber-200/40 bg-[#eac27d]">
      {/* Sliding highlight pill */}
      <span
        className={`absolute h-7 w-[63px] rounded-full bg-amber-600/20 backdrop-blur-[2px] border border-amber-500/30 transition-transform duration-300 ease-out shadow-sm ${
          lang === "hi" ? "translate-x-[63px]" : "translate-x-0"
        }`}
      />

      <button
        onClick={() => setLang("en")}
        className={`z-10 w-[63px] text-center text-[12px] cursor-pointer transition-all duration-300 ${
          lang === "en"
            ? "text-amber-950 font-bold"
            : "text-amber-900/60 hover:text-amber-900"
        }`}
      >
        english
      </button>

      <button
        onClick={() => setLang("hi")}
        className={`z-10 w-[63px] text-center text-[12px] cursor-pointer transition-all duration-300 ${
          lang === "hi"
            ? "text-amber-950 font-bold"
            : "text-amber-900/60 hover:text-amber-900"
        }`}
      >
        हिंदी
      </button>
    </div>
  );
}