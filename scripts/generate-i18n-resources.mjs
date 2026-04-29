import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

export const SUPPORTED_LANGUAGES = [
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
];

export const LOCALE_NAMESPACES = [
  'common',
  'docker-compose',
  'providers',
  'seo',
];

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDirectory, '..');
const localesRoot = path.join(repoRoot, 'src/i18n/locales');
const generatedRoot = path.join(repoRoot, 'src/i18n/generated-locales');
const expectedSourceFiles = LOCALE_NAMESPACES.map((namespace) => `${namespace}.yml`);
const checkOnly = process.argv.includes('--check');

function normalizeNames(values) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function formatJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function listDirectoryNames(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

async function listFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name);
}

async function readYamlMapping(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = yaml.load(raw);
  assert(
    isPlainObject(parsed),
    `Locale source must be a top-level mapping: ${path.relative(repoRoot, filePath)}`,
  );
  return parsed;
}

async function collectSourceArtifacts() {
  const actualLocales = normalizeNames(await listDirectoryNames(localesRoot));
  const expectedLocales = normalizeNames(SUPPORTED_LANGUAGES);

  assert.deepEqual(
    actualLocales,
    expectedLocales,
    `Locale directories in ${path.relative(repoRoot, localesRoot)} must match the configured language set`,
  );

  const artifacts = [];

  for (const locale of SUPPORTED_LANGUAGES) {
    const localeDirectory = path.join(localesRoot, locale);
    const actualFiles = normalizeNames(await listFiles(localeDirectory));

    assert.deepEqual(
      actualFiles,
      normalizeNames(expectedSourceFiles),
      `${locale} must contain ${expectedSourceFiles.join(', ')}`,
    );

    for (const namespace of LOCALE_NAMESPACES) {
      const data = await readYamlMapping(path.join(localeDirectory, `${namespace}.yml`));
      artifacts.push({
        locale,
        namespace,
        data,
      });
    }
  }

  return artifacts;
}

async function walkJsonArtifacts(directory, prefix = '') {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = prefix ? path.posix.join(prefix, entry.name) : entry.name;
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...await walkJsonArtifacts(absolutePath, relativePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.json')) {
      files.push(relativePath);
    }
  }

  return files;
}

async function verifyNoUnexpectedGeneratedArtifacts() {
  try {
    const files = normalizeNames(await walkJsonArtifacts(generatedRoot));
    const expected = normalizeNames(
      SUPPORTED_LANGUAGES.flatMap((locale) =>
        LOCALE_NAMESPACES.map((namespace) => `${locale}/${namespace}.json`),
      ),
    );

    assert.deepEqual(
      files,
      expected,
      `Generated locale artifacts in ${path.relative(repoRoot, generatedRoot)} must match the configured language and namespace set`,
    );
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      if (checkOnly) {
        throw new Error('Generated locale resources are missing; rerun npm run i18n:generate');
      }
      return;
    }

    throw error;
  }
}

async function syncGeneratedArtifacts(artifacts) {
  const errors = [];

  if (!checkOnly) {
    await fs.rm(generatedRoot, { recursive: true, force: true });
  }

  for (const artifact of artifacts) {
    const outputDirectory = path.join(generatedRoot, artifact.locale);
    const outputPath = path.join(outputDirectory, `${artifact.namespace}.json`);
    const nextContent = formatJson(artifact.data);

    if (checkOnly) {
      try {
        const existingContent = await fs.readFile(outputPath, 'utf8');
        if (existingContent !== nextContent) {
          errors.push(`${path.relative(repoRoot, outputPath)} is stale; rerun npm run i18n:generate`);
        }
      } catch (error) {
        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
          errors.push(`${path.relative(repoRoot, outputPath)} is missing; rerun npm run i18n:generate`);
          continue;
        }

        throw error;
      }

      continue;
    }

    await fs.mkdir(outputDirectory, { recursive: true });
    await fs.writeFile(outputPath, nextContent);
  }

  if (checkOnly && errors.length > 0) {
    throw new Error(errors.join('\n'));
  }
}

export async function generateLocaleArtifacts() {
  const artifacts = await collectSourceArtifacts();
  await verifyNoUnexpectedGeneratedArtifacts();
  await syncGeneratedArtifacts(artifacts);
}

generateLocaleArtifacts().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
