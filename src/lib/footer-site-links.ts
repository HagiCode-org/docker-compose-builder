import { resolveSiteLinks } from '@hagicode/hagilight-core/links';

import { siteConfig } from '@/config/seo';
import { DEFAULT_BUILDER_LANGUAGE, resolveBuilderLanguageCode } from '@/i18n/config';

const CURRENT_SITE_ID = 'compose-builder';
const STEAM_URL = 'https://store.steampowered.com/app/4625540/Hagicode/';

/**
 * Resolve the footer link groups from the shared hagilight catalog so related
 * sites, quick links, community links, and filings follow the active locale
 * without a build-time network snapshot.
 */
export function resolveBuilderFooterLinks(locale: string | null | undefined) {
  const resolvedLocale = resolveBuilderLanguageCode(locale, DEFAULT_BUILDER_LANGUAGE);
  const basePath = import.meta.env.BASE_URL;

  return resolveSiteLinks(resolvedLocale, {
    siteId: CURRENT_SITE_ID,
    siteUrl: siteConfig.siteUrl,
    // `/rss.xml` is the English feed; other languages have `/rss.<language>.xml`.
    rssFeedUrl: `${basePath}rss.xml`,
    ...(resolvedLocale === 'en-US' ? {} : { rssLocaleFeedUrl: `${basePath}rss.${resolvedLocale}.xml` }),
    overrides: {
      sitemap: { href: `${basePath}sitemap-index.xml`, external: false },
    },
    extraLinks: {
      community: [{ id: 'steam', label: 'Steam', href: STEAM_URL, external: true }],
    },
  });
}
