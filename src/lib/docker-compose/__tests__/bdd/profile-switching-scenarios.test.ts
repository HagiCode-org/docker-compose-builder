import { describe, expect, it } from 'vitest';
import dockerComposeReducer, { setConfigField } from '../../slice';

const initAction = { type: '@@INIT' };

describe('Docker Compose Configuration: Profile Switching', () => {
  it('preserves explicit executor enablement across quick-start/full-custom switches', () => {
    let state = dockerComposeReducer(undefined, initAction);

    state = dockerComposeReducer(state, setConfigField({ field: 'enabledExecutors', value: ['claude', 'codex', 'iflow-cli'] }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'quick-start' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

    expect(state.config.enabledExecutors).toEqual(['claude', 'codex', 'iflow-cli']);
  });

  it('preserves branch values for Claude, CodeBuddy, and OpenCode across mode switches', () => {
    let state = dockerComposeReducer(undefined, initAction);

    state = dockerComposeReducer(state, setConfigField({ field: 'enabledExecutors', value: ['claude', 'codebuddy-cli', 'opencode'] }));
    state = dockerComposeReducer(state, setConfigField({ field: 'anthropicAuthToken', value: 'claude-token' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codebuddyApiKey', value: 'cb-token' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'openCodeModel', value: 'openai/gpt-5' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'quick-start' }));
    state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

    expect(state.config.anthropicAuthToken).toBe('claude-token');
    expect(state.config.codebuddyApiKey).toBe('cb-token');
    expect(state.config.openCodeModel).toBe('openai/gpt-5');
  });

  it('drops removed legacy routing fields during hydration-style updates', () => {
    let state = dockerComposeReducer(undefined, initAction);

    state = dockerComposeReducer(state, setConfigField({ field: 'enabledExecutors', value: ['codebuddy-cli', 'iflow-cli'] }));
    state = dockerComposeReducer(state, setConfigField({ field: 'codebuddyApiKey', value: 'cb-token' }));

    expect('defaultExecutor' in state.config).toBe(false);
    expect('runtimeProvider' in state.config).toBe(false);
  });
});
