import { describe, it, expect } from 'vitest';
import dockerComposeReducer, { setConfigField } from '../../slice';

const initAction = { type: '@@INIT' };

describe('Docker Compose Configuration: Profile Switching', () => {
  describe('Scenario 1: Preserve executor routing config across mode switches', () => {
    it('Given dual executors and a default route, When switching quick-start/full-custom, Then executor config should be preserved', () => {
      let state = dockerComposeReducer(undefined, initAction);

      state = dockerComposeReducer(state, setConfigField({ field: 'enabledExecutors', value: ['claude', 'codex'] }));
      state = dockerComposeReducer(state, setConfigField({ field: 'defaultExecutor', value: 'codex' }));
      state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

      state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'quick-start' }));
      state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

      expect(state.config.enabledExecutors).toEqual(['claude', 'codex']);
      expect(state.config.defaultExecutor).toBe('codex');
    });
  });

  describe('Scenario 2: Preserve provider branch inputs across mode switches', () => {
    it('Given Claude and Codex fields set, When switching quick-start/full-custom, Then branch values should remain available', () => {
      let state = dockerComposeReducer(undefined, initAction);

      state = dockerComposeReducer(state, setConfigField({ field: 'enabledExecutors', value: ['claude', 'codex'] }));
      state = dockerComposeReducer(state, setConfigField({ field: 'defaultExecutor', value: 'claude' }));
      state = dockerComposeReducer(state, setConfigField({ field: 'anthropicAuthToken', value: 'claude-token' }));
      state = dockerComposeReducer(state, setConfigField({ field: 'codexApiKey', value: 'codex-token' }));
      state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

      state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'quick-start' }));
      state = dockerComposeReducer(state, setConfigField({ field: 'profile', value: 'full-custom' }));

      expect(state.config.anthropicAuthToken).toBe('claude-token');
      expect(state.config.codexApiKey).toBe('codex-token');
    });
  });
});
