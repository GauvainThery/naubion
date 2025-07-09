import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type SupportedLanguage = 'en' | 'fr';

// Constants
const STORAGE_KEY = 'i18nextLng';
const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr'];

/**
 * Custom hook for managing language preferences with localStorage persistence
 * and browser locale detection
 */
export const useLanguage = () => {
  const { i18n } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  // Get the best matching language from browser locale
  const getBrowserLanguage = useCallback((): SupportedLanguage => {
    const browserLang = navigator.language.toLowerCase();

    // Check for exact match first (e.g., 'en', 'fr')
    if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
      return browserLang as SupportedLanguage;
    }

    // Check for language prefix match (e.g., 'en-US' -> 'en', 'fr-CA' -> 'fr')
    const langPrefix = browserLang.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(langPrefix as SupportedLanguage)) {
      return langPrefix as SupportedLanguage;
    }

    // Default to English if no match
    return 'en';
  }, []);

  // Get current language, with fallback handling
  const currentLanguage = (i18n.language || 'en') as SupportedLanguage;

  // Change language with error handling and loading state
  const changeLanguage = useCallback(
    async (language: SupportedLanguage): Promise<boolean> => {
      if (language === currentLanguage || isChanging) {
        return true;
      }

      setIsChanging(true);

      try {
        await i18n.changeLanguage(language);
        localStorage.setItem(STORAGE_KEY, language);

        // Dispatch custom event for other components to react to language change
        window.dispatchEvent(
          new CustomEvent('languageChanged', {
            detail: {
              from: currentLanguage,
              to: language
            }
          })
        );

        return true;
      } catch (error) {
        console.error('Failed to change language:', error);
        return false;
      } finally {
        setIsChanging(false);
      }
    },
    [currentLanguage, i18n, isChanging]
  );

  // Initialize language on mount if not already set
  useEffect(() => {
    const storedLang = localStorage.getItem(STORAGE_KEY);

    if (!storedLang) {
      const browserLang = getBrowserLanguage();
      changeLanguage(browserLang);
    }
  }, [changeLanguage, getBrowserLanguage]);

  return {
    currentLanguage,
    changeLanguage,
    isChanging,
    supportedLanguages: SUPPORTED_LANGUAGES,
    getBrowserLanguage
  };
};

export type { SupportedLanguage };
