"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { pt } from "./pt";
import { en } from "./en";
import type { Translations } from "./pt";

export type Locale = "pt" | "en";

const LOCALES: Record<Locale, Translations> = { pt, en };
const STORAGE_KEY = "surveyflow-locale";

interface I18nContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "pt",
  setLocale: () => {},
  t: pt,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("pt");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "pt" || stored === "en") setLocaleState(stored as Locale);
    } catch {}
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: LOCALES[locale] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
