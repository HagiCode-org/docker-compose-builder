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

  it('shows only the full-custom https section in addition to the shared sections', () => {
    const config = {
      ...defaultConfig,
      profile: 'full-custom' as const,
      anthropicAuthToken: 'sk-ant-test',
      workdirPath: '/workspace/repos',
      enableHttps: true,
      httpsPort: '',
      lanIp: '',
    };

    const sections = getWorkspaceSections(config, validateConfig(config), 'profile');
    const httpsSection = sections.find((section) => section.id === 'https');

    expect(sections.map((section) => section.id)).toEqual(['profile', 'base', 'executors', 'https', 'advanced']);
    expect(httpsSection?.errorCount).toBe(2);
    expect(findFirstErrorSection(sections)?.id).toBe('https');
    expect(isWorkspaceExportReady(sections)).toBe(false);
  });

  it('groups retained executor branch errors under the executor section', () => {
    const config = {
      ...defaultConfig,
      workdirPath: '/workspace/repos',
      enabledExecutors: ['claude', 'codex', 'opencode'] as ExecutorType[],
      anthropicApiProvider: 'custom',
      anthropicAuthToken: '',
      anthropicUrl: '',
      codexApiKey: '',
      openCodeConfigMode: 'host-file' as const,
      openCodeConfigHostPath: '',
    };

    const sections = getWorkspaceSections(config, validateConfig(config), 'executors');
    const executorSection = sections.find((section) => section.id === 'executors');

    expect(executorSection?.errorCount).toBe(4);
    expect(executorSection?.status).toBe('active');
    expect(executorSection?.children.map((child) => child.id)).toEqual([
      'executor-eula',
      'executor-claude',
      'executor-codex',
      'executor-opencode',
    ]);
    expect(executorSection?.children.find((child) => child.id === 'executor-eula')?.isComplete).toBe(true);
    expect(executorSection?.children.find((child) => child.id === 'executor-claude')?.errorCount).toBe(2);
    expect(executorSection?.children.find((child) => child.id === 'executor-codex')?.errorCount).toBe(1);
    expect(executorSection?.children.find((child) => child.id === 'executor-opencode')?.errorCount).toBe(1);
    expect(isWorkspaceExportReady(sections)).toBe(false);
  });

  it('tracks the Code Server child item only in full-custom mode', () => {
    const config = {
      ...defaultConfig,
      profile: 'full-custom' as const,
      anthropicAuthToken: 'sk-ant-test',
      workdirPath: '/workspace/repos',
      codeServerHost: '127.0.0.1',
      codeServerPort: '36529',
      codeServerPublishToHost: true,
      codeServerPublishedPort: '',
    };

    const sections = getWorkspaceSections(config, validateConfig(config), 'executors');
    const codeServerChild = sections
      .find((section) => section.id === 'executors')
      ?.children.find((child) => child.id === 'executor-code-server');

    expect(codeServerChild).toBeDefined();
    expect(codeServerChild?.errorCount).toBe(2);
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
