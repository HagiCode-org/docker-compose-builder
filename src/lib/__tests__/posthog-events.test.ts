import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  captureSiteEvent,
  SITE_EVENT_STRING_MAX_LENGTH,
  SITE_POSTHOG_EVENTS,
  sanitize,
  type SiteEventCaptureOptions,
  type SitePropertySpec,
} from '@/lib/posthog-events';

type FakePostHog = NonNullable<SiteEventCaptureOptions['posthog']>;

// Keys reviewed for each event. A table row that gains a key fails the allowlist test below.
const EXPECTED_KEYS: Readonly<Record<string, readonly string[]>> = {
  compose_exported: ['method', 'https_enabled', 'service_count'],
};

const SUPER_PROPERTY_KEYS = ['site_id', 'site_framework', 'hagilight_version', 'locale', 'page_type'];

function fakePostHog(overrides: Partial<Record<keyof FakePostHog, unknown>> = {}) {
  return {
    __loaded: true,
    capture: vi.fn(),
    has_opted_out_capturing: vi.fn(() => false),
    ...overrides,
  } as unknown as FakePostHog & {
    capture: ReturnType<typeof vi.fn>;
    has_opted_out_capturing: ReturnType<typeof vi.fn>;
  };
}

function sampleValue(spec: SitePropertySpec): unknown {
  switch (spec.kind) {
    case 'string':
      return 'sample';
    case 'boolean':
      return true;
    case 'count':
      return 3;
    case 'enum':
      return spec.values[0];
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('captureSiteEvent', () => {
  const validInput = { method: 'copy', https_enabled: true, service_count: 2 };

  it('sends an allowlisted event with its properties', () => {
    const posthog = fakePostHog();
    captureSiteEvent('compose_exported', validInput, { posthog });
    expect(posthog.capture).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledWith('compose_exported', {
      method: 'copy',
      https_enabled: true,
      service_count: 2,
    });
  });

  it('sends nothing for an unknown event name', () => {
    const posthog = fakePostHog();
    captureSiteEvent('compose_unknown_thing', validInput, { posthog });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('drops keys that are not in the event allowlist', () => {
    const posthog = fakePostHog();
    captureSiteEvent('compose_exported', { ...validInput, yaml: 'services: {}', apiKey: 'sk-test' }, { posthog });
    expect(posthog.capture).toHaveBeenCalledWith('compose_exported', validInput);
  });

  it.each([
    ['object for enum', { method: { value: 'copy' } }],
    ['array for enum', { method: ['copy'] }],
    ['value outside enum', { method: 'share' }],
    ['string for boolean', { https_enabled: 'true' }],
    ['null for boolean', { https_enabled: null }],
    ['fractional count', { service_count: 2.5 }],
    ['negative count', { service_count: -1 }],
    ['NaN count', { service_count: Number.NaN }],
    ['Infinity count', { service_count: Number.POSITIVE_INFINITY }],
    ['string count', { service_count: '2' }],
  ])('drops a non-allowed value: %s', (_label, override) => {
    const posthog = fakePostHog();
    captureSiteEvent('compose_exported', { ...validInput, ...override }, { posthog });
    const sent = posthog.capture.mock.calls[0]?.[1] as Record<string, unknown>;
    for (const [key, value] of Object.entries(override)) {
      expect(sent).not.toHaveProperty(key, value);
    }
  });

  it('drops super-property keys even when the caller passes them', () => {
    const posthog = fakePostHog();
    captureSiteEvent(
      'compose_exported',
      { ...validInput, site_id: 'builder', site_framework: 'astro', hagilight_version: '0.18.0', locale: 'en', page_type: 'home' },
      { posthog },
    );
    expect(posthog.capture).toHaveBeenCalledWith('compose_exported', validInput);
  });

  it('sends nothing and does not throw when window.posthog is undefined', () => {
    vi.stubGlobal('window', {});
    expect(() => captureSiteEvent('compose_exported', validInput)).not.toThrow();
  });

  it('sends nothing and does not throw when there is no window at all', () => {
    expect(() => captureSiteEvent('compose_exported', validInput)).not.toThrow();
  });

  it('queues on the stub when __loaded is not true and does not call has_opted_out_capturing', () => {
    const posthog = fakePostHog({ __loaded: false, has_opted_out_capturing: vi.fn(() => true) });
    captureSiteEvent('compose_exported', validInput, { posthog });
    expect(posthog.capture).toHaveBeenCalledWith('compose_exported', validInput);
    expect(posthog.has_opted_out_capturing).not.toHaveBeenCalled();
  });

  it('checks opt-out before sending once loaded, and sends nothing when opted out', () => {
    const posthog = fakePostHog({ has_opted_out_capturing: vi.fn(() => true) });
    captureSiteEvent('compose_exported', validInput, { posthog });
    expect(posthog.has_opted_out_capturing).toHaveBeenCalledTimes(1);
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('sends when loaded and not opted out', () => {
    const posthog = fakePostHog();
    captureSiteEvent('compose_exported', validInput, { posthog });
    expect(posthog.has_opted_out_capturing).toHaveBeenCalledTimes(1);
    expect(posthog.capture).toHaveBeenCalledTimes(1);
  });

  it('sends nothing when isAllowed returns false, even if PostHog is ready', () => {
    const posthog = fakePostHog();
    captureSiteEvent('compose_exported', validInput, { posthog, isAllowed: () => false });
    expect(posthog.capture).not.toHaveBeenCalled();
  });

  it('sends when isAllowed returns true', () => {
    const posthog = fakePostHog();
    captureSiteEvent('compose_exported', validInput, { posthog, isAllowed: () => true });
    expect(posthog.capture).toHaveBeenCalledTimes(1);
  });

  it('returns normally when capture throws', () => {
    const posthog = fakePostHog({
      capture: vi.fn(() => {
        throw new Error('network down');
      }),
    });
    expect(() => captureSiteEvent('compose_exported', validInput, { posthog })).not.toThrow();
  });
});

describe('string length cap', () => {
  it('truncates a string-kind value to the 128-character cap', () => {
    const allowed: Record<string, SitePropertySpec> = { note: { kind: 'string' } };
    const out = sanitize(allowed, { note: 'x'.repeat(200) });
    expect(SITE_EVENT_STRING_MAX_LENGTH).toBe(128);
    expect(out.note).toHaveLength(128);
  });

  it('keeps a string-kind value at or under the cap unchanged', () => {
    const allowed: Record<string, SitePropertySpec> = { note: { kind: 'string' } };
    expect(sanitize(allowed, { note: 'short' })).toEqual({ note: 'short' });
  });
});

describe('site event allowlist contract', () => {
  it.each(Object.keys(SITE_POSTHOG_EVENTS))('event %s is snake_case with object first and has no super-property key', (name) => {
    expect(name).toMatch(/^[a-z]+(_[a-z]+)+$/);
    for (const key of Object.keys(SITE_POSTHOG_EVENTS[name])) {
      expect(SUPER_PROPERTY_KEYS).not.toContain(key);
    }
  });

  it.each(Object.keys(SITE_POSTHOG_EVENTS))('event %s allowlist equals the reviewed key set', (name) => {
    expect(Object.keys(SITE_POSTHOG_EVENTS[name]).sort()).toEqual([...EXPECTED_KEYS[name]].sort());
  });

  it.each(Object.keys(SITE_POSTHOG_EVENTS))(
    'event %s sends exactly its allowlisted keys for a representative input with a URL, free text and super properties',
    (name) => {
      const table = SITE_POSTHOG_EVENTS[name];
      const input: Record<string, unknown> = {
        url: 'https://builder.example.com/path?token=abc#frag',
        note: 'free text with a domain.example.com and ports 8443 and 9443',
        site_id: 'builder',
        site_framework: 'astro',
        hagilight_version: '0.18.0',
        locale: 'en',
        page_type: 'home',
      };
      for (const [key, spec] of Object.entries(table)) {
        input[key] = sampleValue(spec);
      }
      const posthog = fakePostHog();
      captureSiteEvent(name, input, { posthog });
      expect(posthog.capture).toHaveBeenCalledTimes(1);
      const [sentName, sentProps] = posthog.capture.mock.calls[0] as [string, Record<string, unknown>];
      expect(sentName).toBe(name);
      expect(Object.keys(sentProps).sort()).toEqual([...EXPECTED_KEYS[name]].sort());
    },
  );
});
