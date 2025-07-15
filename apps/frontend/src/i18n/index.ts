import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { getInitialLanguage, SUPPORTED_LANGUAGES } from '../utils/i18n';

// Import English translations
import enCommon from '../locales/en/common.json';
import enHero from '../locales/en/hero.json';
import enFeatures from '../locales/en/features.json';
import enCta from '../locales/en/cta.json';
import enAnalysis from '../locales/en/analysis.json';
import enAdmin from '../locales/en/admin.json';
import enForms from '../locales/en/forms.json';
import enPageCarbonAnalyzer from '../locales/en/page-carbon-analyzer.json';

// Import French translations
import frCommon from '../locales/fr/common.json';
import frHero from '../locales/fr/hero.json';
import frFeatures from '../locales/fr/features.json';
import frCta from '../locales/fr/cta.json';
import frAnalysis from '../locales/fr/analysis.json';
import frAdmin from '../locales/fr/admin.json';
import frForms from '../locales/fr/forms.json';
import frPageCarbonAnalyzer from '../locales/fr/page-carbon-analyzer.json';

const resources = {
  en: {
    common: enCommon,
    hero: enHero,
    features: enFeatures,
    cta: enCta,
    analysis: enAnalysis,
    admin: enAdmin,
    forms: enForms,
    'page-carbon-analyzer': enPageCarbonAnalyzer
  },
  fr: {
    common: frCommon,
    hero: frHero,
    features: frFeatures,
    cta: frCta,
    analysis: frAnalysis,
    admin: frAdmin,
    forms: frForms,
    'page-carbon-analyzer': frPageCarbonAnalyzer
  }
};

const i18nConfig = {
  resources,
  lng: getInitialLanguage(), // Set initial language based on user preference or browser locale
  fallbackLng: 'en',
  defaultNS: 'common',
  supportedLngs: SUPPORTED_LANGUAGES,

  // Language detection configuration
  detection: {
    order: ['localStorage', 'navigator', 'htmlTag'],
    lookupLocalStorage: 'i18nextLng',
    caches: ['localStorage'],
    excludeCacheFor: ['cimode'], // don't cache in development
    checkWhitelist: true
  },

  interpolation: {
    escapeValue: false // not needed for react as it escapes by default
  },

  // React options
  react: {
    useSuspense: false
  }
};

i18n.use(LanguageDetector).use(initReactI18next).init(i18nConfig);

export default i18n;
