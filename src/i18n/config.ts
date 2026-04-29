export const DEFAULT_BUILDER_LANGUAGE = 'zh-CN';
export const LANGUAGE_STORAGE_KEY = 'language';

export const SUPPORTED_BUILDER_LANGUAGE_CODES = [
  'zh-CN',
  'zh-Hant',
  'en-US',
  'ja-JP',
  'ko-KR',
  'de-DE',
  'fr-FR',
  'es-ES',
  'pt-BR',
  'ru-RU',
] as const;

export type BuilderLanguageCode = (typeof SUPPORTED_BUILDER_LANGUAGE_CODES)[number];

export interface BuilderLanguage {
  readonly code: BuilderLanguageCode;
  readonly name: string;
  readonly nativeName: string;
  readonly shortLabel: string;
  readonly fallbackCodes: readonly BuilderLanguageCode[];
}

export const BUILDER_LANGUAGES: readonly BuilderLanguage[] = [
  {
    code: 'zh-CN',
    name: 'Simplified Chinese',
    nativeName: '简体中文',
    shortLabel: '中',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'zh-Hant',
    name: 'Traditional Chinese',
    nativeName: '繁體中文',
    shortLabel: '繁',
    fallbackCodes: ['zh-CN', 'en-US'],
  },
  {
    code: 'en-US',
    name: 'English',
    nativeName: 'English',
    shortLabel: 'EN',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'ja-JP',
    name: 'Japanese',
    nativeName: '日本語',
    shortLabel: '日',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'ko-KR',
    name: 'Korean',
    nativeName: '한국어',
    shortLabel: '한',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'de-DE',
    name: 'German',
    nativeName: 'Deutsch',
    shortLabel: 'DE',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'fr-FR',
    name: 'French',
    nativeName: 'Français',
    shortLabel: 'FR',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'es-ES',
    name: 'Spanish',
    nativeName: 'Español',
    shortLabel: 'ES',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'pt-BR',
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    shortLabel: 'PT',
    fallbackCodes: ['en-US'],
  },
  {
    code: 'ru-RU',
    name: 'Russian',
    nativeName: 'Русский',
    shortLabel: 'RU',
    fallbackCodes: ['en-US'],
  },
] as const;

export const I18N_NAMESPACES = [
  'common',
  'docker-compose',
  'providers',
  'seo',
] as const;

export type BuilderI18nNamespace = (typeof I18N_NAMESPACES)[number];

const LANGUAGE_BY_CODE = new Map<BuilderLanguageCode, BuilderLanguage>(
  BUILDER_LANGUAGES.map((language) => [language.code, language]),
);

function canonicalizeLocaleCandidate(value: string): string {
  const candidate = value.trim().replace(/_/g, '-');
  if (!candidate) {
    return '';
  }

  try {
    return Intl.getCanonicalLocales(candidate)[0] ?? candidate;
  } catch {
    return candidate;
  }
}

export function normalizeBuilderLanguageCode(language: string | null | undefined): BuilderLanguageCode | null {
  if (!language) {
    return null;
  }

  const canonical = canonicalizeLocaleCandidate(language);
  const normalized = canonical.toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized === 'zh-hant' || normalized.includes('-hant') || ['zh-tw', 'zh-hk', 'zh-mo'].includes(normalized)) {
    return 'zh-Hant';
  }

  if (normalized === 'zh' || normalized.includes('-hans') || ['zh-cn', 'zh-sg'].includes(normalized)) {
    return 'zh-CN';
  }

  for (const supportedCode of SUPPORTED_BUILDER_LANGUAGE_CODES) {
    if (supportedCode.toLowerCase() === normalized) {
      return supportedCode;
    }
  }

  const [languagePart] = normalized.split('-');
  switch (languagePart) {
    case 'en':
      return 'en-US';
    case 'ja':
      return 'ja-JP';
    case 'ko':
      return 'ko-KR';
    case 'de':
      return 'de-DE';
    case 'fr':
      return 'fr-FR';
    case 'es':
      return 'es-ES';
    case 'pt':
      return 'pt-BR';
    case 'ru':
      return 'ru-RU';
    default:
      return null;
  }
}

export function resolveBuilderLanguageCode(
  language: string | null | undefined,
  fallback: BuilderLanguageCode = DEFAULT_BUILDER_LANGUAGE,
): BuilderLanguageCode {
  return normalizeBuilderLanguageCode(language) ?? fallback;
}

export function getBuilderLanguage(language: string | null | undefined): BuilderLanguage {
  const code = resolveBuilderLanguageCode(language);
  return LANGUAGE_BY_CODE.get(code) ?? LANGUAGE_BY_CODE.get(DEFAULT_BUILDER_LANGUAGE)!;
}

export function getStoredBuilderLanguage(storage: Storage | undefined = getSafeStorage()): string | null {
  if (!storage) {
    return null;
  }

  try {
    return storage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function persistBuilderLanguage(language: string, storage: Storage | undefined = getSafeStorage()): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(LANGUAGE_STORAGE_KEY, resolveBuilderLanguageCode(language));
  } catch {
    // Ignore unavailable storage so the runtime keeps working in restricted environments.
  }
}

export function resolveInitialBuilderLanguage(
  storage: Storage | undefined = getSafeStorage(),
  browserLanguage: string | null | undefined = getNavigatorLanguage(),
): BuilderLanguageCode {
  const stored = getStoredBuilderLanguage(storage);
  if (stored) {
    return resolveBuilderLanguageCode(stored);
  }

  return resolveBuilderLanguageCode(browserLanguage);
}

export const BUILDER_FALLBACK_LANGUAGE_MAP: Record<string, readonly BuilderLanguageCode[]> = {
  default: ['en-US'],
  'zh-Hant': ['zh-CN', 'en-US'],
  'zh-HK': ['zh-Hant', 'zh-CN', 'en-US'],
  'zh-TW': ['zh-Hant', 'zh-CN', 'en-US'],
  'ja-JP': ['en-US'],
  'ko-KR': ['en-US'],
  'de-DE': ['en-US'],
  'fr-FR': ['en-US'],
  'es-ES': ['en-US'],
  'pt-BR': ['en-US'],
  'ru-RU': ['en-US'],
};

export const i18nConfig = {
  lng: DEFAULT_BUILDER_LANGUAGE,
  fallbackLng: BUILDER_FALLBACK_LANGUAGE_MAP,
  supportedLngs: [...SUPPORTED_BUILDER_LANGUAGE_CODES],
  defaultNS: 'common',
  ns: [...I18N_NAMESPACES],
  nsSeparator: ':',
  keySeparator: '.',
  interpolation: {
    escapeValue: false,
    formatSeparator: ',',
    format: (value: string, format?: string) => {
      if (format === 'uppercase') {
        return value.toUpperCase();
      }

      if (format === 'lowercase') {
        return value.toLowerCase();
      }

      return value;
    },
  },
  react: {
    useSuspense: false,
    bindI18n: 'languageChanged',
    bindI18nStore: 'added',
    transEmptyNodeValue: '',
    transSupportBasicHtmlNodes: true,
    transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'p'],
  },
  debug: import.meta.env.DEV,
  returnEmptyString: false,
} as const;

function getSafeStorage(): Storage | undefined {
  if (typeof window === 'undefined') {
    return undefined;
  }

  return window.localStorage;
}

function getNavigatorLanguage(): string | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return navigator.language ?? navigator.languages?.[0] ?? null;
}
