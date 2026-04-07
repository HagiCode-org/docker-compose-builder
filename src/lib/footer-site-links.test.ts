import { describe, expect, it } from 'vitest';

import { resolveBuilderFooterSiteLinks } from './footer-site-links';

describe('builder footer site links', () => {
  it('reads related site links from the bundled snapshot and excludes the current builder site', () => {
    const links = resolveBuilderFooterSiteLinks('en-US');

    expect(links.some((link) => link.href === 'https://builder.hagicode.com/')).toBe(false);
    expect(links.some((link) => link.href === 'https://docs.hagicode.com/')).toBe(true);
    expect(links.find((link) => link.siteId === 'hagicode-docs')).toMatchObject({
      label: 'HagiCode Docs',
      description: '使用指南',
    });
  });
});
