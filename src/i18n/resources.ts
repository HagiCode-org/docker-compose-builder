import {
  BUILDER_LANGUAGES,
  DEFAULT_BUILDER_LANGUAGE,
  I18N_NAMESPACES,
  type BuilderI18nNamespace,
  type BuilderLanguageCode,
  resolveBuilderLanguageCode,
} from './config';

type LocaleTree = Record<string, unknown>;
type NamespaceResources = Record<BuilderI18nNamespace, LocaleTree>;
type BuilderResourceStore = Record<BuilderLanguageCode, NamespaceResources>;

const localeModules = import.meta.glob('./generated-locales/*/*.json', {
  eager: true,
  import: 'default',
}) as Record<string, LocaleTree>;

function buildEmptyResources(): BuilderResourceStore {
  return Object.fromEntries(
    BUILDER_LANGUAGES.map((language) => [
      language.code,
      Object.fromEntries(I18N_NAMESPACES.map((namespace) => [namespace, {}])) as NamespaceResources,
    ]),
  ) as BuilderResourceStore;
}

function getModuleLocalePath(pathname: string): { locale: BuilderLanguageCode; namespace: BuilderI18nNamespace } | null {
  const match = pathname.match(/generated-locales\/([^/]+)\/([^/]+)\.json$/u);
  if (!match) {
    return null;
  }

  const [, locale, namespace] = match;
  if (!BUILDER_LANGUAGES.some((language) => language.code === locale)) {
    return null;
  }

  if (!I18N_NAMESPACES.some((candidate) => candidate === namespace)) {
    return null;
  }

  return {
    locale: locale as BuilderLanguageCode,
    namespace: namespace as BuilderI18nNamespace,
  };
}

export const builderI18nResources: BuilderResourceStore = Object.entries(localeModules).reduce(
  (resources, [pathname, value]) => {
    const parsed = getModuleLocalePath(pathname);
    if (!parsed) {
      return resources;
    }

    resources[parsed.locale][parsed.namespace] = isPlainObject(value) ? value : {};
    return resources;
  },
  buildEmptyResources(),
);

export function getBuilderFallbackChain(language: string | null | undefined): BuilderLanguageCode[] {
  const primary = resolveBuilderLanguageCode(language);
  const metadata = BUILDER_LANGUAGES.find((candidate) => candidate.code === primary);
  const fallbackCodes = metadata?.fallbackCodes ?? [];
  return Array.from(new Set([primary, ...fallbackCodes, DEFAULT_BUILDER_LANGUAGE]));
}

export function getBuilderResourceValue(
  language: string | null | undefined,
  key: string,
  interpolation?: Record<string, string | number>,
): unknown {
  const [namespacePart, pathPart] = key.includes(':')
    ? key.split(':', 2)
    : ['common', key];
  const namespace = namespacePart as BuilderI18nNamespace;

  for (const locale of getBuilderFallbackChain(language)) {
    const value = getNestedValue(builderI18nResources[locale]?.[namespace], pathPart);
    if (typeof value === 'string') {
      return interpolate(value, interpolation);
    }

    if (value !== undefined) {
      return value;
    }
  }

  return undefined;
}

export function getBuilderMessage(
  language: string | null | undefined,
  key: string,
  interpolation?: Record<string, string | number>,
  fallback = key,
): string {
  const value = getBuilderResourceValue(language, key, interpolation);
  return typeof value === 'string' ? value : fallback;
}

function getNestedValue(source: unknown, path: string): unknown {
  if (!path) {
    return source;
  }

  return path.split('.').reduce<unknown>((current, segment) => {
    if (!isPlainObject(current)) {
      return undefined;
    }

    return current[segment];
  }, source);
}

function interpolate(template: string, interpolation?: Record<string, string | number>): string {
  if (!interpolation) {
    return template;
  }

  return template.replace(/\{\{\s*([.\w-]+)\s*\}\}/gu, (_match, key) => {
    const value = interpolation[key];
    return value === undefined ? `{{${key}}}` : String(value);
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
