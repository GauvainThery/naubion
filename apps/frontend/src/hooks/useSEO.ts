import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

interface SEOData {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  type?: string;
  url?: string;
  canonicalUrl?: string;
  robots?: string;
}

const DEFAULT_SEO: SEOData = {
  title: 'Naubion - Website Environmental Impact Analyzer | Carbon Footprint Calculator',
  description:
    "Analyze and reduce your website's carbon footprint with Naubion. Get real-time environmental impact assessments, green hosting analysis, and actionable insights to make your web presence more sustainable.",
  keywords:
    'website carbon footprint, environmental impact, green hosting, sustainable web development, web sustainability, carbon calculator, eco-friendly website, digital carbon emissions',
  image: 'https://naubion.com/assets/naubion-og-image.jpg',
  type: 'website'
};

export function useSEO(seoData: SEOData = {}) {
  const location = useLocation();
  const { i18n } = useTranslation();

  useEffect(() => {
    const {
      title = DEFAULT_SEO.title,
      description = DEFAULT_SEO.description,
      keywords = DEFAULT_SEO.keywords,
      image = DEFAULT_SEO.image,
      type = DEFAULT_SEO.type,
      robots = 'index, follow',
      canonicalUrl
    } = seoData;

    const baseUrl = 'https://naubion.com';
    const currentUrl = canonicalUrl || `${baseUrl}${location.pathname}`;

    // Update document title
    document.title = title || DEFAULT_SEO.title!;

    // Helper function to update or create meta tags
    const updateMetaTag = (selector: string, content: string) => {
      let element = document.querySelector(selector) as HTMLMetaElement;
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        const [attr, value] = selector.includes('property=')
          ? ['property', selector.match(/property="([^"]+)"/)?.[1] || '']
          : ['name', selector.match(/name="([^"]+)"/)?.[1] || ''];
        element.setAttribute(attr, value);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Update canonical URL
    let canonicalElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (canonicalElement) {
      canonicalElement.href = currentUrl;
    } else {
      canonicalElement = document.createElement('link');
      canonicalElement.rel = 'canonical';
      canonicalElement.href = currentUrl;
      document.head.appendChild(canonicalElement);
    }

    // Update basic meta tags
    updateMetaTag('meta[name="description"]', description!);
    updateMetaTag('meta[name="keywords"]', keywords!);
    updateMetaTag('meta[name="robots"]', robots);

    // Update Open Graph tags
    updateMetaTag('meta[property="og:title"]', title!);
    updateMetaTag('meta[property="og:description"]', description!);
    updateMetaTag('meta[property="og:image"]', image!);
    updateMetaTag('meta[property="og:url"]', currentUrl);
    updateMetaTag('meta[property="og:type"]', type!);
    updateMetaTag('meta[property="og:locale"]', i18n.language === 'fr' ? 'fr_FR' : 'en_US');

    // Update Twitter Card tags
    updateMetaTag('meta[property="twitter:title"]', title!);
    updateMetaTag('meta[property="twitter:description"]', description!);
    updateMetaTag('meta[property="twitter:image"]', image!);
    updateMetaTag('meta[property="twitter:url"]', currentUrl);

    // Update HTML lang attribute
    document.documentElement.lang = i18n.language;
  }, [seoData, location.pathname, i18n.language]);
}

// Pre-defined SEO data for different pages
export const PAGE_SEO = {
  home: {
    title: 'naubion - Website Environmental Impact Analyzer | Carbon Footprint Calculator',
    description:
      "Reduce your website's environmental impact with naubion. Analyze carbon footprint, assess green hosting, and get actionable insights for sustainable web development.",
    keywords:
      'website carbon footprint, environmental impact analyzer, green hosting checker, sustainable web development, web sustainability tools, carbon calculator, eco-friendly website optimization'
  },

  pageCarbonFootprint: {
    title: 'Web Page Carbon Footprint Analyzer | Free Environmental Impact Assessment - naubion',
    description:
      "Analyze any web page's carbon footprint for free. Get detailed environmental impact reports, resource breakdown, and optimization recommendations to reduce your website's emissions.",
    keywords:
      'page carbon footprint, website environmental impact, web sustainability analysis, carbon emissions calculator, green web development, eco-friendly website audit, digital carbon footprint'
  },

  admin: {
    title: 'Admin Dashboard - naubion',
    description: 'Administrative dashboard for naubion environmental impact analyzer.',
    keywords: 'naubion admin, dashboard, administration',
    robots: 'noindex, nofollow, noarchive, nosnippet'
  }
} as const;

export default useSEO;
