"use client";

import Image from "next/image";
import LanguageButton, { useLanguage } from "@/components/ui/LanguageButton";
import LanguageProvider from "@/components/ui/LanguageProvider";
import StepCard from "@/components/ui/StepCard";
import VenueQRCard from "@/components/ui/VenueQRcard";

// ─── i18n strings ────────────────────────────────────────────────
const strings = {
  en: {
    welcomeTo: "Welcome to",
    hotelName: "Kasoori Methi",
    tagline: "Where every meal is a celebration of flavour",
    howTitle: "How to Browse Our Menu",
    venuesTitle: "Scan Your Venue",
    footer: "Scan · Browse · Savour  ◆  Please ask your server for assistance",
    steps: [
      {
        title: "Scan the QR",
        description:
          "Use your phone camera or any QR scanner app to scan the code placed at your table",
      },
      {
        title: "Choose Language",
        description:
          "Switch between English and Hindi at any time using the toggle at the top right",
      },
      {
        title: "Browse Categories",
        description:
          "Swipe through Starters, Mains and Desserts — green dot means vegetarian",
      },
      {
        title: "Place Your Order",
        description:
          "Let your server know your selections — they are always nearby to assist you",
      },
    ],
    venues: [
      { name: "Restaurant", area: "Main dining hall", tag: "Full menu" },
      { name: "Pool Side", area: "Outdoor pool deck", tag: "Light bites" },
      { name: "Lobby Café", area: "Ground floor lounge", tag: "All day dining" },
    ],
  },
  hi: {
    welcomeTo: "आपका स्वागत है",
    hotelName: "कसूरी मेथी",
    tagline: "जहाँ हर भोजन स्वाद का उत्सव है",
    howTitle: "मेनू कैसे देखें",
    venuesTitle: "अपना वेन्यू स्कैन करें",
    footer:
      "स्कैन करें · देखें · आनंद लें  ◆  किसी भी सहायता के लिए अपने सर्वर से पूछें",
    steps: [
      {
        title: "QR स्कैन करें",
        description:
          "टेबल पर रखे कोड को अपने फोन के कैमरे या किसी QR स्कैनर ऐप से स्कैन करें",
      },
      {
        title: "भाषा चुनें",
        description:
          "ऊपर दाईं ओर टॉगल से किसी भी समय अंग्रेज़ी और हिंदी में बदलें",
      },
      {
        title: "श्रेणियाँ देखें",
        description:
          "स्टार्टर, मेन्स और डेज़र्ट स्वाइप करें — हरा बिंदु शाकाहारी दर्शाता है",
      },
      {
        title: "ऑर्डर दें",
        description:
          "अपने सर्वर को अपनी पसंद बताएं — वे हमेशा पास में उपलब्ध हैं",
      },
    ],
    venues: [
      { name: "रेस्टोरेंट", area: "मुख्य भोजन कक्ष", tag: "पूर्ण मेनू" },
      { name: "पूल साइड", area: "आउटडोर पूल डेक", tag: "हल्का नाश्ता" },
      { name: "लॉबी कैफे", area: "भूतल लाउंज", tag: "सारा दिन भोजन" },
    ],
  },
} as const;

const venueAccents = ["#1a2b1e", "#2d3a5c", "#3a2e1a"];

// ─── Inner page (needs language context) ─────────────────────────
function WelcomeContent() {
  const { lang } = useLanguage();
  const t = strings[lang];

  return (
    <div className="min-h-screen bg-[#1e1b35] flex flex-col overflow-y-auto gap-5">

      {/* Botanical background pattern */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none">
        <Image
          src="/bg-texture-homepage.jpg"
          alt="bg"
          height={5000}
          width={5000}
          className="w-full h-full object-cover"
        />
      </div>

      {/* ── Header ──────────────────────────────────────────────── */}
      <header className="absolute flex w-full z-50 items-center p-10 justify-between">
        <Image
          src="/english-logo.png"
          alt="Kasoori Methi logo"
          height={1000}
          width={1000}
          className="h-20 w-fit object-contain"
        />
        <LanguageButton />
      </header>

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pb-2 shrink-0 pt-10">
        <span
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.22em" }}
          className="text-[15px] text-[#c9a84c]/60 uppercase mb-1"
        >
          {t.welcomeTo}
        </span>
        <h1
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.14em" }}
          className="text-[30px] font-medium text-[#e8d59a] leading-tight"
        >
          {t.hotelName}
        </h1>
        <p
          style={{ fontFamily: "'Cormorant Garamond', serif" }}
          className="text-[18px] italic text-[#c9a84c]/55 mt-1"
        >
          {t.tagline}
        </p>

        {/* Gold divider */}
        <div className="flex items-center gap-3">
          <div className="h-px w-12 bg-[#c9a84c]/30" />
          <span className="text-[#c9a84c]/50 text-[9px]">◆</span>
          <div className="h-px w-12 bg-[#c9a84c]/30" />
        </div>
      </section>

      {/* ── Steps ───────────────────────────────────────────────── */}
      <section className="relative z-10 px-6 shrink-0 flex flex-col gap-5">
        <p
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.2em" }}
          className="text-[9px] text-[#c9a84c]/50 uppercase text-center mb-2"
        >
          {t.howTitle}
        </p>
        <div className="flex items-center justify-center">
          <div className="grid grid-cols-2 gap-2.5">
          {t.steps.map((step, i) => (
            <StepCard
              key={i}
              number={i + 1}
              title={step.title}
              description={step.description}
            />
          ))}
        </div>
        </div>
      </section>

      {/* ── Venue QR cards ──────────────────────────────────────── */}
      <section className="relative z-10 px-6 flex-shrink-0 flex flex-col gap-5">
        {/* Section header with side lines */}
        <div className="flex items-center gap-3 mb-3">
          <div className="h-px flex-1 bg-[#c9a84c]/25" />
          <p
            style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.2em" }}
            className="text-[9px] text-[#c9a84c]/50 uppercase"
          >
            {t.venuesTitle}
          </p>
          <div className="h-px flex-1 bg-[#c9a84c]/25" />
        </div>

        {/* 3 venue cards — equal width, centred */}
          <div className="flex gap-3 justify-center">
          {t.venues.map((venue, i) => (
            <VenueQRCard
              key={i}
              name={venue.name}
              area={venue.area}
              tag={venue.tag}
              accentColor={venueAccents[i]}
            />
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="relative z-10 pb-3 text-center flex-shrink-0">
        <p
          style={{ fontFamily: "'Cinzel', serif", letterSpacing: "0.1em" }}
          className="text-[9px] text-[#c9a84c]/30"
        >
          {t.footer}
        </p>
      </footer>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────
export default function WelcomePage() {
  return (
    <LanguageProvider>
      <WelcomeContent />
    </LanguageProvider>
  );
}