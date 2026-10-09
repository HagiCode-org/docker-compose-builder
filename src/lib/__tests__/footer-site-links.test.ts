import { describe, expect, it } from 'vitest';

import { resolveBuilderFooterLinks } from '../footer-site-links';

describe('builder footer links', () => {
  it('reads related sites from the hagilight catalog and excludes the current builder site', () => {
    const { relatedSites } = resolveBuilderFooterLinks('en-US');

    expect(relatedSites.some((site) => site.id === 'compose-builder')).toBe(false);
    expect(relatedSites.some((site) => site.href.startsWith('https://builder.hagicode.com'))).toBe(false);
    expect(relatedSites.find((site) => site.id === 'status-page')).toMatchObject({
      name: 'HagiCode Status',
      href: 'https://status.hagicode.com/',
    });
  });

  it('keeps localized related-site metadata for non-English builder locales', () => {
    const { relatedSites, labels } = resolveBuilderFooterLinks('ja-JP');

    expect(labels.community).toBe('コミュニティ');
    expect(relatedSites.find((site) => site.id === 'hagitask')?.description).toBe('タスクとワークフローを管理します。');
  });

  it('falls back to the default builder locale for unsupported languages', () => {
    expect(resolveBuilderFooterLinks('xx-XX').locale).toBe(resolveBuilderFooterLinks(undefined).locale);
  });

  it('serves the generated sitemap index and keeps the builder-owned Steam link', () => {
    const { quick, community } = resolveBuilderFooterLinks('en-US');

    expect(quick.find((link) => link.id === 'sitemap')?.href).toBe('/sitemap-index.xml');
    expect(community.find((link) => link.id === 'steam')).toMatchObject({
      href: 'https://store.steampowered.com/app/4625540/Hagicode/',
      target: '_blank',
      rel: 'noopener noreferrer',
    });
    expect(community.map((link) => link.id)).toEqual(expect.arrayContaining(['github', 'discord', 'qqGroup']));
  });

  it('links the English feed and a current-language feed for other locales', () => {
    const english = resolveBuilderFooterLinks('en-US').quick;
    expect(english.find((link) => link.id === 'rss')?.href).toBe('/rss.xml');
    expect(english.some((link) => link.id === 'rssLocale')).toBe(false);

    const japanese = resolveBuilderFooterLinks('ja-JP').quick;
    expect(japanese.find((link) => link.id === 'rss')?.href).toBe('/rss.xml');
    expect(japanese.find((link) => link.id === 'rssLocale')?.href).toBe('/rss.ja-JP.xml');
  });
});
