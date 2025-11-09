import React, { createContext, useState, useContext, useCallback } from 'react';
import { translations } from '../locales';

type Locale = 'en' | 'pi';

interface LocaleContextType {
  locale: Locale;
  toggleLocale: () => void;
  // FIX: Updated 't' function signature to support interpolation.
  t: (key: string, replacements?: Record<string, string | number>) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>('en');

  const toggleLocale = () => {
    setLocale(prevLocale => (prevLocale === 'en' ? 'pi' : 'en'));
  };

  // FIX: Updated 't' function implementation to support interpolation.
  const t = useCallback((key: string, replacements?: Record<string, string | number>) => {
    const keys = key.split('.');
    let result: any = translations[locale];
    let translationFound = true;
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        translationFound = false;
        break;
      }
    }

    if (!translationFound) {
      // Fallback to English if translation is missing
      let fallbackResult: any = translations['en'];
      for (const fk of keys) {
          fallbackResult = fallbackResult?.[fk];
      }
      result = fallbackResult;
    }
    
    let strResult = result || key;

    if (typeof strResult === 'string' && replacements) {
        Object.keys(replacements).forEach(rKey => {
            strResult = strResult.replace(new RegExp(`{{\\s*${rKey}\\s*}}`, 'g'), String(replacements[rKey]));
        });
    }

    return strResult;
  }, [locale]);

  return (
    <LocaleContext.Provider value={{ locale, toggleLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};