"use client";

import { useState } from "react";
import { Language, LanguageContext } from "@/components/ui/LanguageButton";

export default function LanguageProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lang, setLang] = useState<Language>("en");
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}