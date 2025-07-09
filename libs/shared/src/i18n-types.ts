export interface TranslationResources {
  common: {
    nav: {
      home: string;
      analysis: string;
      admin: string;
    };
    buttons: {
      submit: string;
      join: string;
      analyze: string;
      back: string;
      loading: string;
    };
    messages: {
      success: string;
      error: string;
      required: string;
    };
  };
  hero: {
    title: string;
    subtitle: string;
    comingSoon: string;
    waitingList: string;
    emailPlaceholder: string;
    successMessage: string;
  };
  features: {
    title: string;
    subtitle: string;
    cards: {
      tracking: {
        title: string;
        description: string;
      };
      optimization: {
        title: string;
        description: string;
      };
      monitoring: {
        title: string;
        description: string;
      };
    };
  };
  cta: {
    title: string;
    subtitle: string;
    button: string;
  };
  analysis: {
    title: string;
    form: {
      urlLabel: string;
      urlPlaceholder: string;
      analyzeButton: string;
    };
    results: {
      loading: string;
      error: string;
      carbonFootprint: string;
      transferSize: string;
      resources: string;
      greenHosting: string;
      recommendations: string;
    };
  };
  admin: {
    title: string;
    stats: {
      totalAnalyses: string;
      avgCarbonFootprint: string;
      cacheHitRate: string;
    };
  };
  forms: {
    validation: {
      email: {
        required: string;
        invalid: string;
      };
      url: {
        required: string;
        invalid: string;
      };
    };
  };
}

export type SupportedLanguage = 'en' | 'fr';

export interface LanguageConfig {
  code: SupportedLanguage;
  name: string;
  flag: string;
}
