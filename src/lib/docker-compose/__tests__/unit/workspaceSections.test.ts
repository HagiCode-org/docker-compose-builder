import { describe, expect, it } from 'vitest';

import type { ExecutorType } from '@/lib/docker-compose/types';
import { defaultConfig } from '@/lib/docker-compose/defaultConfig';
import { validateConfig } from '@/lib/docker-compose/validation';
import {
  findFirstErrorSection,
  getWorkspaceSections,
  getWorkspaceSummary,
  isWorkspaceExportReady,
} from '@/components/docker-compose/layout/workspaceSections';

describe('workspace section metadata', () => {
  it('hides full-custom-only sections when quick start is selected', () => {
    const config = {
      ...defaultConfig,
      anthropicAuthToken: 'sk-ant-test',
      workdirPath: '/workspace/repos',
    };

    const sections = getWorkspaceSections(config, validateConfig(config), 'profile');

    expect(sections.map((section) => section.id)).toEqual(['profile', 'base', 'executors', 'advanced']);
  });

  it('keeps conditional HTTPS and database sections visible and maps their errors', () => {
    const config = {
      ...defaultConfig,
      profile: 'full-custom' as const,
      anthropicAuthToken: 'sk-ant-test',
      workdirPath: '/workspace/repos',
      enableHttps: true,
      httpsPort: '',
      lanIp: '',
      databaseType: 'external' as const,
      externalDbHost: '',
      externalDbPort: '',
    };

    const sections = getWorkspaceSections(config, validateConfig(config), 'profile');
    const httpsSection = sections.find((section) => section.id === 'https');
    const databaseSection = sections.find((section) => section.id === 'database');

    expect(httpsSection?.errorCount).toBe(2);
    expect(databaseSection?.errorCount).toBe(2);
    expect(findFirstErrorSection(sections)?.id).toBe('https');
    expect(isWorkspaceExportReady(sections)).toBe(false);
  });

  it('groups executor branch errors under the executor section', () => {
    const config = {
      ...defaultConfig,
      workdirPath: '/workspace/repos',
      enabledExecutors: ['claude', 'codex', 'copilot-cli'] as ExecutorType[],
      anthropicApiProvider: 'custom',
      anthropicAuthToken: '',
      anthropicUrl: '',
      codexApiKey: '',
      copilotApiKey: '',
    };

    const sections = getWorkspaceSections(config, validateConfig(config), 'executors');
    const executorSection = sections.find((section) => section.id === 'executors');

    expect(executorSection?.errorCount).toBe(4);
    expect(executorSection?.status).toBe('active');
    expect(executorSection?.children.map((child) => child.id)).toEqual([
      'executor-claude',
      'executor-codex',
      'executor-copilot',
    ]);
    expect(executorSection?.children.find((child) => child.id === 'executor-claude')?.errorCount).toBe(2);
    expect(isWorkspaceExportReady(sections)).toBe(false);
  });

  it('reports a fully ready workspace summary when all required inputs are present', () => {
    const config = {
      ...defaultConfig,
      anthropicAuthToken: 'sk-ant-test',
      workdirPath: '/workspace/repos',
    };

    const sections = getWorkspaceSections(config, validateConfig(config), 'advanced');
    const summary = getWorkspaceSummary(sections);

    expect(summary).toEqual({
      total: 4,
      completed: 4,
      errored: 0,
    });
    expect(isWorkspaceExportReady(sections)).toBe(true);
  });
});
