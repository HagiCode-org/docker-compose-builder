import { describe, expect, it } from 'vitest';

import dockerComposeReducer, { setConfigField, updateConfig } from '../../slice';

const initAction = { type: '@@INIT' };

describe('Docker Compose Configuration: Profile Switching', () => {
  it('preserves retained executor enablement across quick-start/full-custom switches', () => {
    let state = dockerComposeReducer(undefined, initAction);

    state = dockerComposeReducer(state, setConfigField({
      field: 'enabledExecutors',
      value: ['claude', 'codex', 'opencode']
    }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'quick-start' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

    expect(state.config.enabledExecutors).toEqual(['claude', 'codex', 'opencode']);
  });

  it('preserves retained executor values across mode switches', () => {
    let state = dockerComposeReducer(undefined, initAction);

    state = dockerComposeReducer(state, setConfigField({
      field: 'enabledExecutors',
      value: ['claude', 'codex', 'opencode']
    }));
    state = dockerComposeReducer(state, setConfigField({ field: 'anthropicAuthToken', value: 'claude-token' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codexApiKey', value: 'codex-token' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'openCodeModel', value: 'openai/gpt-5' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'openCodeConfigMode', value: 'host-file' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'openCodeConfigHostPath', value: '/state/opencode/opencode.json' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'quick-start' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

    expect(state.config.anthropicAuthToken).toBe('claude-token');
    expect(state.config.codexApiKey).toBe('codex-token');
    expect(state.config.openCodeModel).toBe('openai/gpt-5');
    expect(state.config.openCodeConfigMode).toBe('host-file');
    expect(state.config.openCodeConfigHostPath).toBe('/state/opencode/opencode.json');
  });

  it('preserves Code Server custom-mode values across quick-start/full-custom switches', () => {
    let state = dockerComposeReducer(undefined, initAction);

    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'enableCodeServer', value: true }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codeServerHost', value: '0.0.0.0' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codeServerPort', value: '36531' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codeServerPublishToHost', value: true }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codeServerPublishedPort', value: '36532' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codeServerAuthMode', value: 'password' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codeServerPassword', value: 'secret-value' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'quick-start' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

    expect(state.config.enableCodeServer).toBe(true);
    expect(state.config.codeServerHost).toBe('0.0.0.0');
    expect(state.config.codeServerPort).toBe('36531');
    expect(state.config.codeServerPublishToHost).toBe(true);
    expect(state.config.codeServerPublishedPort).toBe('36532');
    expect(state.config.codeServerAuthMode).toBe('password');
    expect(state.config.codeServerPassword).toBe('secret-value');
  });

  it('drops removed legacy routing and executor fields during update-style normalization', () => {
    let state = dockerComposeReducer(undefined, initAction);

    state = dockerComposeReducer(state, updateConfig({
      enabledExecutors: ['claude', 'copilot-cli', 'opencode'] as never,
      codebuddyApiKey: 'cb-token',
      copilotApiKey: 'copilot-token'
    } as never));

    expect(state.config.enabledExecutors).toEqual(['claude', 'opencode']);
    expect('defaultExecutor' in state.config).toBe(false);
    expect('runtimeProvider' in state.config).toBe(false);
    expect('codebuddyApiKey' in state.config).toBe(false);
    expect('copilotApiKey' in state.config).toBe(false);
  });
});
