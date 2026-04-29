import {
  DEFAULT_BUILDER_LANGUAGE,
  SUPPORTED_BUILDER_LANGUAGE_CODES,
  resolveBuilderLanguageCode,
} from '@/i18n/config';
import { getBuilderMessage, getBuilderResourceValue } from '@/i18n/resources';

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  image: string;
  url: string;
  type: 'website' | 'web-application' | 'article';
  locale: string;
  alternateLocales?: string[];
  twitterHandle?: string;
}

export interface PageSEOConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  noindex?: boolean;
  canonical?: string;
}

export function buildDefaultSEOConfig(language: string | null | undefined = DEFAULT_BUILDER_LANGUAGE): SEOConfig {
  const locale = resolveBuilderLanguageCode(language);
  const keywords = getBuilderResourceValue(locale, 'seo:default.keywords');

  return {
    title: getBuilderMessage(locale, 'seo:default.title'),
    description: getBuilderMessage(locale, 'seo:default.description'),
    keywords: Array.isArray(keywords) ? keywords.filter((keyword): keyword is string => typeof keyword === 'string') : [],
    image: '/og-image.png',
    url: 'https://builder.hagicode.com',
    type: 'web-application',
    locale,
    alternateLocales: SUPPORTED_BUILDER_LANGUAGE_CODES.filter((candidate) => candidate !== locale),
  };
}

export const defaultSEOConfig: SEOConfig = buildDefaultSEOConfig();

export const siteConfig = {
  name: 'Hagicode Docker Compose Builder',
  siteUrl: 'https://builder.hagicode.com',
  githubUrl: 'https://github.com/newbe36524/docker-compose-builder',
  author: {
    name: 'newbe36524',
    url: 'https://github.com/newbe36524'
  },
  organization: {
    name: 'Hagicode',
    url: 'https://github.com/newbe36524'
  }
};

export function getPageSEOMetadata(
  language: string | null | undefined = DEFAULT_BUILDER_LANGUAGE,
): Record<string, PageSEOConfig> {
  const locale = resolveBuilderLanguageCode(language);
  return {
    '/': {
      title: getBuilderMessage(locale, 'seo:pages.home.title'),
      description: getBuilderMessage(locale, 'seo:pages.home.description'),
    },
  };
}
