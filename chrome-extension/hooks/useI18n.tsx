import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { i18n, type Language, type Translations } from '../lib/i18n';

// Create a context for i18n
interface I18nContextType {
  currentLanguage: Language;
  changeLanguage: (language: Language) => void;
  t: (key: keyof Translations, params?: Record<string, string>) => string;
  getAllLanguages: () => Array<{ code: Language; name: string; nativeName: string }>;
  formatDate: (date: Date) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Provider component
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(i18n.getLanguage());
  
  const changeLanguage = useCallback((language: Language) => {
    i18n.setLanguage(language);
    setCurrentLanguage(language);
  }, []);
  
  const t = useCallback((key: keyof Translations, params?: Record<string, string>) => {
    return i18n.t(key, params);
  }, [currentLanguage]); // Re-run when language changes
  
  const getAllLanguages = useCallback(() => {
    return i18n.getAllLanguages();
  }, []);
  
  const formatDate = useCallback((date: Date) => {
    return i18n.formatDate(date);
  }, [currentLanguage]);
  
  return (
    <I18nContext.Provider value={{
      currentLanguage,
      changeLanguage,
      t,
      getAllLanguages,
      formatDate,
    }}>
      {children}
    </I18nContext.Provider>
  );
}

// Hook to use i18n context
export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}