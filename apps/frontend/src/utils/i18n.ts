/**
 * Utility functions for internationalization (i18n)
 */

export type SupportedLanguage = 'en' | 'fr';

export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'fr'];
export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';
export const STORAGE_KEY = 'i18nextLng';

/**
 * Get the best matching language from browser locale
 */
export const getBrowserLanguage = (): SupportedLanguage => {
  if (typeof navigator === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

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
  return DEFAULT_LANGUAGE;
};

/**
 * Get language from localStorage or use browser language as fallback
 */
export const getInitialLanguage = (): SupportedLanguage => {
  if (typeof localStorage === 'undefined') {
    return getBrowserLanguage();
  }

  const storedLang = localStorage.getItem(STORAGE_KEY);

  if (storedLang && SUPPORTED_LANGUAGES.includes(storedLang as SupportedLanguage)) {
    return storedLang as SupportedLanguage;
  }

  return getBrowserLanguage();
};

/**
 * Save language preference to localStorage
 */
export const saveLanguagePreference = (language: SupportedLanguage): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, language);
  }
};

/**
 * Check if a language is supported
 */
export const isSupportedLanguage = (lang: string): lang is SupportedLanguage => {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

/**
 * Language configuration for display purposes
 */
export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const LANGUAGE_CONFIGS: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇬🇧'
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  }
];

/**
 * Get language configuration by code
 */
export const getLanguageConfig = (code: SupportedLanguage): LanguageConfig | undefined => {
  return LANGUAGE_CONFIGS.find(config => config.code === code);
};
