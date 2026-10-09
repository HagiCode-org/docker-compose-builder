import type { RssFeedCallback } from '@hagicode/hagilight/integration';
import { resolveSiteLinks } from '@hagicode/hagilight-core/links';

import { buildDefaultSEOConfig } from '@/config/seo';
import { resolveBuilderLanguageCode } from '@/i18n/config';

/**
 * The builder has no dated posts, so each localized feed lists the tool itself
 * plus the official Docker Compose installation guide.
 */
const getFeed: RssFeedCallback = async ({ lang }) => {
  const locale = resolveBuilderLanguageCode(lang);
  const seo = buildDefaultSEOConfig(locale);
  const installGuide = resolveSiteLinks(locale).quick.find((link) => link.id === 'dockerCompose');

  return {
    title: seo.title,
    description: seo.description,
    items: [
      { title: seo.title, description: seo.description, link: '/' },
      ...(installGuide ? [{ title: installGuide.label, link: installGuide.href }] : []),
    ],
  };
};

export default getFeed;
