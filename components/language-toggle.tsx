"use client";

import { useI18n, type Locale } from "@/lib/i18n";

const FLAGS: Record<Locale, string> = { pt: "🇧🇷", en: "🇺🇸" };
const LABELS: Record<Locale, string> = { pt: "PT", en: "EN" };
const OTHER: Record<Locale, Locale> = { pt: "en", en: "pt" };

export function LanguageToggle({ variant = "sidebar" }: { variant?: "sidebar" | "navbar" }) {
  const { locale, setLocale } = useI18n();
  const next = OTHER[locale];

  if (variant === "navbar") {
    // Shows the TARGET locale (what you'll switch TO) — clearer intent
    return (
      <button
        onClick={() => setLocale(next)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-[13px] text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
        title={next === "en" ? "Switch to English" : "Mudar para Português"}
      >
        <span>{FLAGS[next]}</span>
        <span className="font-medium">{LABELS[next]}</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
      {(["pt", "en"] as Locale[]).map((l) => (
        <button
          key={l}
          onClick={() => setLocale(l)}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
            locale === l
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <span>{FLAGS[l]}</span>
          <span>{LABELS[l]}</span>
        </button>
      ))}
    </div>
  );
}
