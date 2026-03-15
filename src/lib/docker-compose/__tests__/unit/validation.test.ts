import { describe, expect, it } from 'vitest';
import { isValidConfig, validateConfig } from '../../validation';
import {
  createCodeBuddyConfig,
  createIFlowConfig,
  createMockConfig,
  createOpenCodeConfig,
} from '../helpers/config';

describe('validateConfig', () => {
  it('requires at least one enabled executor', () => {
    const errors = validateConfig(createMockConfig({ enabledExecutors: [] }));

    expect(errors.filter((error) => error.field === 'enabledExecutors')).toHaveLength(1);
  });

  it('does not require a removed default-executor field', () => {
    const errors = validateConfig(createMockConfig({ enabledExecutors: ['claude', 'codex'], codexApiKey: 'test-codex-key' }));

    expect(errors.some((error) => error.field === 'defaultExecutor')).toBe(false);
  });

  it('validates Claude fields only when Claude is enabled', () => {
    const claudeErrors = validateConfig(createMockConfig({ anthropicAuthToken: '' }));
    const codexOnlyErrors = validateConfig(createMockConfig({
      enabledExecutors: ['codex'],
      anthropicAuthToken: '',
      codexApiKey: 'test-codex-key',
    }));

    expect(claudeErrors.some((error) => error.field === 'anthropicAuthToken')).toBe(true);
    expect(codexOnlyErrors.some((error) => error.field === 'anthropicAuthToken')).toBe(false);
  });

  it('validates Codex fields only when Codex is enabled', () => {
    const errors = validateConfig(createMockConfig({
      enabledExecutors: ['claude', 'codex'],
      codexApiKey: '',
    }));

    expect(errors.some((error) => error.field === 'codexApiKey')).toBe(true);
  });

  it('keeps the standard image tag while validating Copilot-specific credentials', () => {
    const errors = validateConfig(createMockConfig({
      enabledExecutors: ['copilot-cli'],
      imageTag: '0',
      copilotApiKey: '',
    }));

    expect(errors.some((error) => error.field === 'copilotApiKey')).toBe(true);
    expect(errors.some((error) => error.field === 'imageTag')).toBe(false);
  });

  it('requires CODEBUDDY_API_KEY when CodeBuddy is enabled', () => {
    const errors = validateConfig(createCodeBuddyConfig({ codebuddyApiKey: '' }));

    expect(errors.some((error) => error.field === 'codebuddyApiKey')).toBe(true);
  });

  it('does not invent required IFLOW-specific env validation', () => {
    const errors = validateConfig(createIFlowConfig());

    expect(errors.some((error) => error.field.startsWith('iflow'))).toBe(false);
  });

  it('does not require OpenCode-specific fields beyond normal deployment validation', () => {
    const errors = validateConfig(createOpenCodeConfig());

    expect(errors.some((error) => error.field === 'openCodeModel')).toBe(false);
  });

  it('validates custom Claude endpoint when Claude custom provider is enabled', () => {
    const errors = validateConfig(createMockConfig({
      anthropicApiProvider: 'custom',
      anthropicUrl: '',
    }));

    expect(errors.some((error) => error.field === 'anthropicUrl')).toBe(true);
  });

  it('validates shared deployment fields such as workdir and ports', () => {
    const errors = validateConfig(createMockConfig({
      httpPort: 'invalid',
      workdirPath: '',
    }));

    expect(errors.some((error) => error.field === 'httpPort')).toBe(true);
    expect(errors.some((error) => error.field === 'workdirPath')).toBe(true);
  });
});

describe('isValidConfig', () => {
  it('returns true for a standard valid config', () => {
    expect(isValidConfig(createMockConfig())).toBe(true);
  });

  it('returns true for explicit executor combinations without a default provider route', () => {
    expect(isValidConfig(createMockConfig({
      enabledExecutors: ['claude', 'codex', 'codebuddy-cli', 'iflow-cli', 'opencode'],
      anthropicAuthToken: 'test-token',
      codexApiKey: 'test-codex-key',
      codebuddyApiKey: 'cb-test-key',
      codebuddyInternetEnvironment: 'ioa',
    }))).toBe(true);
  });
});
