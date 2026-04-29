import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import { getBuilderMessage } from '@/i18n/resources';

import { SiteFooter } from '../SiteFooter';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, values?: Record<string, string | number>) => getBuilderMessage('en-US', key, values),
    i18n: { resolvedLanguage: 'en-US' },
  }),
}));

describe('SiteFooter', () => {
  it('renders the repo-owned Steam support link with safe external attributes', () => {
    const markup = renderToStaticMarkup(<SiteFooter />);

    expect(markup).toContain('>Steam<');
    expect(markup).toContain('href="https://store.steampowered.com/app/4625540/Hagicode/"');
    expect(markup).toContain('target="_blank"');
    expect(markup).toContain('rel="noopener noreferrer"');
  });
});
