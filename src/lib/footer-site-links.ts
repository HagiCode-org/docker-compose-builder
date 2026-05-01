import footerSitesSnapshot from '@/data/footer-sites.snapshot.json';
import {
  DEFAULT_BUILDER_LANGUAGE,
  getBuilderLanguage,
  resolveBuilderLanguageCode,
  type BuilderLanguageCode,
} from '@/i18n/config';

export interface FooterCatalogLink {
  siteId: string;
  label: string;
  description: string;
  href: string;
}

type LocalizedFooterField = string | Readonly<Record<BuilderLanguageCode, string>>;

type FooterSnapshotEntry = {
  id: string;
  title: LocalizedFooterField;
  description: LocalizedFooterField;
  url: string;
};

const DEFAULT_RELATED_SITE_ORDER = [
  'hagicode-main',
  'hagicode-docs',
  'newbe-blog',
  'index-data',
  'compose-builder',
  'cost-calculator',
  'status-page',
  'awesome-design-gallery',
  'soul-builder',
  'trait-builder',
] as const;

const CURRENT_SITE_ID = 'compose-builder';

function resolveLocalizedField(field: LocalizedFooterField, locale: BuilderLanguageCode): string {
  if (typeof field === 'string') {
    return field;
  }

  const resolutionChain = [locale, ...getBuilderLanguage(locale).fallbackCodes, DEFAULT_BUILDER_LANGUAGE];
  for (const candidate of resolutionChain) {
    const value = field[candidate];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  for (const value of Object.values(field)) {
    if (typeof value === 'string' && value.trim().length > 0) {
      return value;
    }
  }

  return '';
}

export function resolveBuilderFooterSiteLinks(locale: string | null | undefined): FooterCatalogLink[] {
  const resolvedLocale = resolveBuilderLanguageCode(locale, DEFAULT_BUILDER_LANGUAGE);
  const snapshotById = new Map<string, FooterSnapshotEntry>(
    footerSitesSnapshot.entries.map((entry) => [entry.id, entry as FooterSnapshotEntry]),
  );

  return DEFAULT_RELATED_SITE_ORDER.flatMap((siteId) => {
    const entry = snapshotById.get(siteId);
    if (!entry || entry.id === CURRENT_SITE_ID) {
      return [];
    }

    return [
      {
        siteId: entry.id,
        label: resolveLocalizedField(entry.title, resolvedLocale),
        description: resolveLocalizedField(entry.description, resolvedLocale),
        href: entry.url,
      },
    ];
  });
}
