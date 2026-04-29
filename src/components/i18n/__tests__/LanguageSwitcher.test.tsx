import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

import {
  BUILDER_LANGUAGES,
  DEFAULT_BUILDER_LANGUAGE,
  persistBuilderLanguage,
  resolveInitialBuilderLanguage,
} from '@/i18n/config';

import { LanguageSwitcher } from '../LanguageSwitcher';

let activeLanguage = DEFAULT_BUILDER_LANGUAGE;

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: {
      resolvedLanguage: activeLanguage,
      language: activeLanguage,
      changeLanguage: vi.fn(),
    },
    t: (key: string) => key,
  }),
}));

vi.mock('@/components/ui/select', () => ({
  Select: ({ value, children }: { value?: string; children: ReactNode }) => (
    <div data-select-value={value}>{children}</div>
  ),
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder?: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ value, children }: { value: string; children: ReactNode }) => (
    <div data-language-option={value}>{children}</div>
  ),
}));

describe('LanguageSwitcher', () => {
  it('renders every Desktop-supported language option', () => {
    activeLanguage = 'en-US';
    const markup = renderToStaticMarkup(<LanguageSwitcher />);

    for (const language of BUILDER_LANGUAGES) {
      expect(markup).toContain(`data-language-option="${language.code}"`);
      expect(markup).toContain(language.nativeName);
    }
  });

  it('rerenders the selected value across the full supported language matrix', () => {
    for (const language of BUILDER_LANGUAGES) {
      activeLanguage = language.code;
      const markup = renderToStaticMarkup(<LanguageSwitcher />);
      expect(markup).toContain(`data-select-value="${language.code}"`);
    }
  });

  it('normalizes persisted language values and falls back to zh-CN when unsupported', () => {
    const storage = createMemoryStorage();

    persistBuilderLanguage('fr', storage);
    expect(storage.getItem('language')).toBe('fr-FR');

    storage.setItem('language', 'invalid-language');
    expect(resolveInitialBuilderLanguage(storage, 'en-GB')).toBe(DEFAULT_BUILDER_LANGUAGE);

    storage.setItem('language', 'pt_BR');
    expect(resolveInitialBuilderLanguage(storage, 'en-GB')).toBe('pt-BR');
  });
});

function createMemoryStorage(): Storage {
  const store = new Map<string, string>();

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    },
  };
}
