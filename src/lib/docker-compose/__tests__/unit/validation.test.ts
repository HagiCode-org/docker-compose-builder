import { describe, expect, it } from 'vitest';

import { isValidConfig, validateConfig } from '../../validation';
import {
  createMockConfig,
  createOpenCodeConfig,
} from '../helpers/config';

describe('validateConfig', () => {
  it('requires at least one enabled executor', () => {
    const errors = validateConfig(createMockConfig({ enabledExecutors: [] }));

    expect(errors.filter((error) => error.field === 'enabledExecutors')).toHaveLength(1);
  });

  it('does not require a removed default-executor field', () => {
    const errors = validateConfig(createMockConfig({
      enabledExecutors: ['claude', 'codex'],
      codexApiKey: 'test-codex-key'
    }));

    expect(errors.some((error) => error.field === 'defaultExecutor')).toBe(false);
  });

  it('validates Claude fields only when Claude is enabled', () => {
    const claudeErrors = validateConfig(createMockConfig({ anthropicAuthToken: '' }));
    const codexOnlyErrors = validateConfig(createMockConfig({
      enabledExecutors: ['codex'],
      anthropicAuthToken: '',
      codexApiKey: 'test-codex-key'
    }));

    expect(claudeErrors.some((error) => error.field === 'anthropicAuthToken')).toBe(true);
    expect(codexOnlyErrors.some((error) => error.field === 'anthropicAuthToken')).toBe(false);
  });

  it('validates Codex fields only when Codex is enabled', () => {
    const errors = validateConfig(createMockConfig({
      enabledExecutors: ['claude', 'codex'],
      codexApiKey: ''
    }));

    expect(errors.some((error) => error.field === 'codexApiKey')).toBe(true);
  });

  it('does not require OpenCode-specific fields beyond normal deployment validation', () => {
    const errors = validateConfig(createOpenCodeConfig());

    expect(errors.some((error) => error.field === 'openCodeModel')).toBe(false);
    expect(errors.some((error) => error.field === 'openCodeConfigHostPath')).toBe(false);
  });

  it('ignores retained Code Server custom-mode errors while quick-start is active', () => {
    const errors = validateConfig(createMockConfig({
      profile: 'quick-start',
      codeServerHost: 'not-a-host',
      codeServerPort: '70000',
      codeServerPublishToHost: true,
      codeServerPublishedPort: '',
      codeServerAuthMode: 'password',
      codeServerPassword: '',
    }));

    expect(errors.some((error) => error.field.startsWith('codeServer'))).toBe(false);
  });

  it('requires deployable Code Server settings in full-custom mode', () => {
    const errors = validateConfig(createMockConfig({
      profile: 'full-custom',
      codeServerHost: '127.0.0.1',
      codeServerPort: '45000',
      codeServerPublishToHost: true,
      codeServerPublishedPort: '8080',
      codeServerAuthMode: 'password',
      codeServerPassword: '',
    }));

    expect(errors.some((error) => error.field === 'codeServerHost')).toBe(true);
    expect(errors.some((error) => error.field === 'codeServerPort')).toBe(true);
    expect(errors.some((error) => error.field === 'codeServerPassword')).toBe(true);
  });

  it('accepts a publishable Code Server configuration in full-custom mode', () => {
    const errors = validateConfig(createMockConfig({
      profile: 'full-custom',
      codeServerHost: '0.0.0.0',
      codeServerPort: '36529',
      codeServerPublishToHost: true,
      codeServerPublishedPort: '36530',
      codeServerAuthMode: 'password',
      codeServerPassword: 'super-secret',
    }));

    expect(errors.some((error) => error.field.startsWith('codeServer'))).toBe(false);
  });

  it('requires a valid OpenCode host-file path only when host-file mode is enabled', () => {
    const errors = validateConfig(createOpenCodeConfig({
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: '/srv/opencode/'
    }));

    expect(errors.some((error) => error.field === 'openCodeConfigHostPath')).toBe(true);
  });

  it('accepts OpenCode host-file paths that match the selected host OS', () => {
    const linuxErrors = validateConfig(createOpenCodeConfig({
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: '/srv/opencode/opencode.json',
      openCodeAuthHostPath: '/srv/opencode/auth.json',
      openCodeModelsHostPath: '/srv/opencode/models.json',
    }));
    const windowsErrors = validateConfig(createOpenCodeConfig({
      hostOS: 'windows',
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: 'C:\\\\opencode\\\\opencode.json',
      openCodeAuthHostPath: 'C:\\\\opencode\\\\auth.json',
      openCodeModelsHostPath: 'C:\\\\opencode\\\\models.json',
    }));

    expect(linuxErrors.some((error) => error.field === 'openCodeConfigHostPath')).toBe(false);
    expect(linuxErrors.some((error) => error.field === 'openCodeAuthHostPath')).toBe(false);
    expect(linuxErrors.some((error) => error.field === 'openCodeModelsHostPath')).toBe(false);
    expect(windowsErrors.some((error) => error.field === 'openCodeConfigHostPath')).toBe(false);
    expect(windowsErrors.some((error) => error.field === 'openCodeAuthHostPath')).toBe(false);
    expect(windowsErrors.some((error) => error.field === 'openCodeModelsHostPath')).toBe(false);
  });

  it('validates optional OpenCode auth and models paths when they are provided', () => {
    const errors = validateConfig(createOpenCodeConfig({
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: '/srv/opencode/opencode.json',
      openCodeAuthHostPath: '/srv/opencode/auth/',
      openCodeModelsHostPath: 'models.json',
    }));

    expect(errors.some((error) => error.field === 'openCodeAuthHostPath')).toBe(true);
    expect(errors.some((error) => error.field === 'openCodeModelsHostPath')).toBe(true);
  });

  it('validates custom Claude endpoint when Claude custom provider is enabled', () => {
    const errors = validateConfig(createMockConfig({
      anthropicApiProvider: 'custom',
      anthropicUrl: ''
    }));

    expect(errors.some((error) => error.field === 'anthropicUrl')).toBe(true);
  });

  it('validates shared deployment fields such as workdir and ports', () => {
    const errors = validateConfig(createMockConfig({
      httpPort: 'invalid',
      workdirPath: ''
    }));

    expect(errors.some((error) => error.field === 'httpPort')).toBe(true);
    expect(errors.some((error) => error.field === 'workdirPath')).toBe(true);
  });
});

describe('isValidConfig', () => {
  it('returns true for a standard valid config', () => {
    expect(isValidConfig(createMockConfig())).toBe(true);
  });

  it('returns true for retained executor combinations without a default provider route', () => {
    expect(isValidConfig(createMockConfig({
      enabledExecutors: ['claude', 'codex', 'opencode'],
      anthropicAuthToken: 'test-token',
      codexApiKey: 'test-codex-key',
      openCodeModel: 'openai/gpt-5'
    }))).toBe(true);
  });

  it('returns true for a valid full-custom Code Server publish configuration', () => {
    expect(isValidConfig(createMockConfig({
      profile: 'full-custom',
      codeServerHost: '0.0.0.0',
      codeServerPort: '36529',
      codeServerPublishToHost: true,
      codeServerPublishedPort: '36531',
      codeServerAuthMode: 'password',
      codeServerPassword: 'super-secret',
    }))).toBe(true);
  });
});
