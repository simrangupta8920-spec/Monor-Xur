import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Language, Translations, translations, formatTranslation } from '../i18n/translations';
import { getAssameseTranslation } from '../i18n/assameseDictionary';
import { soundController } from '../utils/audio';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: keyof Translations | string, params?: Record<string, string | number>) => string;
  tx: (en: string, hi: string, as?: string) => string;
  isHindi: boolean;
  isAssamese: boolean;
  formatLocalizedDate: (date: Date) => string;
  speak: (textEn: string, textHi: string, onEnd?: () => void, textAs?: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'monor_xur_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi' || stored === 'as') {
        return stored;
      }
    }
    return 'en';
  });

  const setLanguage = useCallback((newLang: Language) => {
    setLanguageState(newLang);
    soundController.setLanguage(newLang);
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, newLang);
        document.documentElement.lang = newLang;
      }
    } catch {
      // Ignore
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'en' ? 'hi' : language === 'hi' ? 'as' : 'en');
  }, [language, setLanguage]);

  useEffect(() => {
    soundController.setLanguage(language);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (key: keyof Translations | string, params?: Record<string, string | number>): string => {
      const langDict = (translations as Record<string, Record<string, string>>)[language] || translations.en;
      const text = langDict[key as string] || (translations.en as Record<string, string>)[key as string] || String(key);
      return formatTranslation(text, params);
    },
    [language]
  );

  const tx = useCallback(
    (en: string, hi: string, as?: string): string => {
      if (language === 'as') {
        return as || getAssameseTranslation(en, hi);
      }
      return language === 'hi' ? hi : en;
    },
    [language]
  );

  const formatLocalizedDate = useCallback(
    (date: Date): string => {
      try {
        if (language === 'as') {
          return new Intl.DateTimeFormat('as-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(date);
        }
        if (language === 'hi') {
          return new Intl.DateTimeFormat('hi-IN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          }).format(date);
        }
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(date);
      } catch {
        return date.toLocaleDateString();
      }
    },
    [language]
  );

  const speak = useCallback(
    (textEn: string, textHi: string, onEnd?: () => void, textAs?: string) => {
      if (language === 'as') {
        soundController.speak(textAs || getAssameseTranslation(textEn, textHi), onEnd, 'as');
      } else if (language === 'hi') {
        soundController.speak(textHi, onEnd, 'hi');
      } else {
        soundController.speak(textEn, onEnd, 'en');
      }
    },
    [language]
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        t,
        tx,
        isHindi: language === 'hi',
        isAssamese: language === 'as',
        formatLocalizedDate,
        speak,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
