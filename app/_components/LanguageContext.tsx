"use client";

import { createContext, useContext, useEffect, useState, ReactNode, useCallback, useMemo } from "react";
import { translations, Language } from "../_lib/translations";

type LanguageContextType = {
  language: Language;
  t: typeof translations[Language];
  toggleLanguage: () => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const SUPPORTED_LANGUAGES = Object.keys(translations) as Language[];

/**
 * Checks whether a string represents a supported language code.
 *
 * Supported languages are derived from the keys of the translations object.
 *
 * @param lang - The value to check; may be `null`.
 * @returns `true` if `lang` is a supported language code, `false` otherwise. Narrows the type to `Language` when `true`.
 */
function isValidLanguage(lang: string | null): lang is Language {
  return lang !== null && SUPPORTED_LANGUAGES.includes(lang as Language);
}

/**
 * Supplies language state, the active translation dictionary, and a toggle function to descendant components.
 *
 * During server-side rendering and before the component mounts, the provider uses `"en"` to avoid hydration
 * mismatches; on the client it restores a saved language from localStorage (key `"app-language"`), persists
 * changes, and updates `document.documentElement.lang`.
 *
 * @returns The context provider element that supplies `{ language, t, toggleLanguage }` to descendants.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [mounted, setMounted] = useState(false);

  // 初期ロード: localStorage から保存済み言語設定を復元
  useEffect(() => {
    try {
      const rawLang = localStorage.getItem("app-language");
      if (isValidLanguage(rawLang)) {
        // SSR では "en" 固定でハイドレーション不整合を避け、マウント後に
        // localStorage の保存値で復元する意図的なパターン
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLanguage(rawLang);
      }
    } catch {
      // localStorage アクセス失敗時（プライベートブラウズ等）はデフォルト言語を維持
    } finally {
      setMounted(true);
    }
  }, []);

  // 言語変更の副作用: localStorage 保存と html lang 属性の更新
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem("app-language", language);
    } catch {
      // localStorage 書き込み失敗時は無視（設定は次回セッションで失われる）
    }
    document.documentElement.lang = language;
  }, [language, mounted]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prevLang) => {
      const currentIndex = SUPPORTED_LANGUAGES.indexOf(prevLang);
      return SUPPORTED_LANGUAGES[(currentIndex + 1) % SUPPORTED_LANGUAGES.length];
    });
  }, []);

  // Hydration ミスマッチ防止: SSR 時はデフォルト言語を返す
  const value = useMemo(() => ({
    language: mounted ? language : "en",
    t: mounted ? translations[language] : translations["en"],
    toggleLanguage,
  }), [mounted, language, toggleLanguage]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

/**
 * Access the app's current language context.
 *
 * @returns The LanguageContext value: `{ language, t, toggleLanguage }`.
 * @throws If called outside of a `LanguageProvider`.
 */
export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}