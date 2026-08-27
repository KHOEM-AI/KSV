import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LANGUAGES, TRANSLATIONS, translate, type LanguageCode } from './translations';

// ======================================================================
// KSV — Language Context (Domain #1, part 2: Language)
//
// This is the ONE place that holds "what language is the app in right
// now." Every screen and every button reads from here through the
// `t()` function instead of holding its own text. Change the language
// here → every component that called t() re-renders in the new
// language automatically, because React Context propagates the change.
//
// This is exactly the mechanism the spec asked for:
//   "A Japanese user taps Japanese → the WHOLE app becomes Japanese."
// It is not per-screen, per-button, or per-language-pair — one switch,
// everywhere, because everywhere reads from the same source.
// ======================================================================

interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'ksv.language';

function detectInitialLanguage(): LanguageCode {
  const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
  if (saved && saved in TRANSLATIONS) return saved as LanguageCode;

  // Fall back to the browser's own language before defaulting to English.
  // This is a starting guess only — the user's explicit tap always wins
  // and is what gets remembered from then on.
  const browserLang = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'en';
  return (browserLang in TRANSLATIONS ? browserLang : 'en') as LanguageCode;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(detectInitialLanguage);

  const info = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[1];

  useEffect(() => {
    // Reflects the chosen language on the <html> tag so native browser
    // behavior (spellcheck, font selection, right-to-left layout for
    // Arabic, etc.) follows the same single source of truth.
    document.documentElement.lang = language;
    document.documentElement.dir = info.dir;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language, info.dir]);

  function setLanguage(lang: LanguageCode) {
    setLanguageState(lang);
  }

  function t(key: string, vars?: Record<string, string | number>) {
    return translate(language, key, vars);
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, dir: info.dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage() must be used inside <LanguageProvider>. Wrap your <App /> with it in main.tsx.');
  }
  return ctx;
}
