import { beforeEach, describe, expect, it, vi } from 'vitest';

const initAction = { type: '@@INIT' };

function createLocalStorageMock(): Storage {
  const storage = new Map<string, string>();

  return {
    clear: () => storage.clear(),
    getItem: (key) => storage.get(key) ?? null,
    key: (index) => Array.from(storage.keys())[index] ?? null,
    removeItem: (key) => {
      storage.delete(key);
    },
    setItem: (key, value) => {
      storage.set(key, value);
    },
    get length() {
      return storage.size;
    }
  };
}

describe('docker compose slice standard image tag normalization', () => {
  beforeEach(() => {
    const localStorageMock = createLocalStorageMock();
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { localStorage: localStorageMock }
    });
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: localStorageMock
    });
    localStorage.clear();
    localStorage.setItem('docker-compose-config-version', '2.5');
    vi.resetModules();
  });

  it('keeps the default standard image tag at 0 on initialization', async () => {
    const sliceModule = await import('../../slice');
    const state = sliceModule.default(undefined, initAction);

    expect(state.config.imageTag).toBe('0');
  });

  it('normalizes legacy copilot tag values back to 0 during hydration', async () => {
    localStorage.setItem('docker-compose-config-version', '2.5');
    localStorage.setItem('docker-compose-config', JSON.stringify({
      enabledExecutors: ['claude', 'copilot-cli'],
      imageTag: '1.2.3-copilot',
      copilotMountWorkspace: true,
    }));

    const sliceModule = await import('../../slice');
    const state = sliceModule.default(undefined, initAction);

    expect(state.config.imageTag).toBe('0');
  });

  it('resets leaked copilot template tags when switching profiles', async () => {
    const sliceModule = await import('../../slice');
    let state = sliceModule.default(undefined, initAction);

    state = sliceModule.default(state, sliceModule.setConfigField({ field: 'imageTag', value: '1.2.3-copilot' }));
    expect(state.config.imageTag).toBe('1.2.3-copilot');

    state = sliceModule.default(state, sliceModule.setConfigField({ field: 'profile', value: 'full-custom' }));
    expect(state.config.imageTag).toBe('0');
  });
});
