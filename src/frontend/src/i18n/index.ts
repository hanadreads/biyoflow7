// Language context + hook.
// Exposes t(key, vars?) for interpolation and lang toggle.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import React from "react";
import { en } from "./en";
import type { StringKey } from "./en";
import { so } from "./so";

export type Lang = "en" | "so";

const STORAGE_KEY = "biyo_lang";

const dictionaries: Record<Lang, typeof en> = { en, so: so as typeof en };

// Interpolate {placeholder} patterns in a string
function interpolate(
  template: string,
  vars?: Record<string, string | number>,
): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, k) =>
    vars[k] !== undefined ? String(vars[k]) : `{${k}}`,
  );
}

export interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggleLang: () => void;
  t: (key: StringKey, vars?: Record<string, string | number>) => string;
}

export const LangContext = createContext<LangContextValue>({
  lang: "en",
  setLang: () => {},
  toggleLang: () => {},
  t: (key) => key as string,
});

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === "so" ? "so" : "en";
  });

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  }, []);

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "so" : "en");
  }, [lang, setLang]);

  const t = useCallback(
    (key: StringKey, vars?: Record<string, string | number>): string => {
      const dict = dictionaries[lang];
      const raw = (dict[key] ?? dictionaries.en[key] ?? key) as string;
      return interpolate(raw, vars);
    },
    [lang],
  );

  // Keep html lang attribute in sync
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return React.createElement(
    LangContext.Provider,
    { value: { lang, setLang, toggleLang, t } },
    children,
  );
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
