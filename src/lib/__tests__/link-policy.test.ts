import { describe, expect, it } from 'vitest';

import { getExternalLinkRel, isFirstPartyHref } from '../link-policy';

describe('first-party link policy', () => {
  it.each([
    'https://hagicode.com',
    'https://docs.hagicode.com/installation/docker-compose/',
    'https://BUILDER.HAGICODE.COM/',
    'https://github.com/HagiCode-org/site',
    'https://github.com/hagicode-org/site/issues',
    '/index-catalog.json',
  ])('classifies %s as first-party', (href) => {
    expect(isFirstPartyHref(href)).toBe(true);
    expect(getExternalLinkRel(href)).toBe('noopener');
  });

  it.each([
    'https://discord.gg/qY662sJK',
    'https://hagicode.com.evil.example/',
    'https://nothagicode.com/',
    'https://example.com/hagicode.com',
    'https://github.com/HagiCode-org-fake/site',
    '//evil.example/hagicode.com',
    'javascript:alert(1)',
  ])('classifies %s as third-party', (href) => {
    expect(isFirstPartyHref(href)).toBe(false);
    expect(getExternalLinkRel(href)).toBe('noopener noreferrer');
  });

  it('treats a missing destination as third-party', () => {
    expect(getExternalLinkRel(null)).toBe('noopener noreferrer');
    expect(getExternalLinkRel(undefined)).toBe('noopener noreferrer');
  });
});
