import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import yaml from 'js-yaml';
import { describe, expect, it } from 'vitest';

import {
  I18N_NAMESPACES,
  SUPPORTED_BUILDER_LANGUAGE_CODES,
  type BuilderI18nNamespace,
  type BuilderLanguageCode,
} from '@/i18n/config';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDirectory, '../../..');
const localesRoot = path.join(repoRoot, 'src/i18n/locales');
const generatedRoot = path.join(repoRoot, 'src/i18n/generated-locales');
const baseLocale: BuilderLanguageCode = 'en-US';

describe('locale resource parity', () => {
  it('keeps the locale and generated directory sets aligned with the Desktop language matrix', () => {
    const sourceLocales = listDirectoryNames(localesRoot);
    const generatedLocales = listDirectoryNames(generatedRoot);
    const expectedLocales = [...SUPPORTED_BUILDER_LANGUAGE_CODES].sort();

    expect(sourceLocales).toEqual(expectedLocales);
    expect(generatedLocales).toEqual(expectedLocales);
  });

  it('keeps namespace files aligned for every locale', () => {
    const expectedSourceFiles = [...I18N_NAMESPACES].map((namespace) => `${namespace}.yml`).sort();
    const expectedGeneratedFiles = [...I18N_NAMESPACES].map((namespace) => `${namespace}.json`).sort();

    for (const locale of SUPPORTED_BUILDER_LANGUAGE_CODES) {
      expect(listFileNames(path.join(localesRoot, locale))).toEqual(expectedSourceFiles);
      expect(listFileNames(path.join(generatedRoot, locale))).toEqual(expectedGeneratedFiles);
    }
  });

  it('keeps source keys and placeholders aligned with the base locale', () => {
    for (const namespace of I18N_NAMESPACES) {
      const baseSource = readYamlLocale(baseLocale, namespace);
      const baseKeys = flattenKeys(baseSource);
      const basePlaceholders = collectPlaceholders(baseSource);

      for (const locale of SUPPORTED_BUILDER_LANGUAGE_CODES) {
        const localeSource = readYamlLocale(locale, namespace);

        expect(flattenKeys(localeSource)).toEqual(baseKeys);
        expect(collectPlaceholders(localeSource)).toEqual(basePlaceholders);
      }
    }
  });

  it('keeps generated JSON fresh with the YAML source tree', () => {
    for (const locale of SUPPORTED_BUILDER_LANGUAGE_CODES) {
      for (const namespace of I18N_NAMESPACES) {
        expect(readJsonLocale(locale, namespace)).toEqual(readYamlLocale(locale, namespace));
      }
    }
  });
});

function listDirectoryNames(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

function listFileNames(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
}

function readYamlLocale(locale: BuilderLanguageCode, namespace: BuilderI18nNamespace): Record<string, unknown> {
  const content = fs.readFileSync(path.join(localesRoot, locale, `${namespace}.yml`), 'utf8');
  const parsed = yaml.load(content);

  expect(isPlainObject(parsed)).toBe(true);
  return parsed as Record<string, unknown>;
}

function readJsonLocale(locale: BuilderLanguageCode, namespace: BuilderI18nNamespace): Record<string, unknown> {
  return JSON.parse(fs.readFileSync(path.join(generatedRoot, locale, `${namespace}.json`), 'utf8')) as Record<string, unknown>;
}

function flattenKeys(source: unknown, prefix = ''): string[] {
  if (!isPlainObject(source)) {
    return prefix ? [prefix] : [];
  }

  return Object.entries(source)
    .flatMap(([key, value]) => flattenKeys(value, prefix ? `${prefix}.${key}` : key))
    .sort();
}

function collectPlaceholders(source: unknown, prefix = ''): Record<string, string[]> {
  if (typeof source === 'string') {
    return {
      [prefix]: Array.from(source.matchAll(/\{\{\s*([.\w-]+)\s*\}\}/gu), (match) => match[1]).sort(),
    };
  }

  if (!isPlainObject(source)) {
    return {};
  }

  return Object.entries(source).reduce<Record<string, string[]>>((accumulator, [key, value]) => ({
    ...accumulator,
    ...collectPlaceholders(value, prefix ? `${prefix}.${key}` : key),
  }), {});
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
