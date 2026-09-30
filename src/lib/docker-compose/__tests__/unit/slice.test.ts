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

describe('docker compose slice sanitization', () => {
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
    localStorage.setItem('docker-compose-config-version', '2.8');
    vi.resetModules();
  });

  it('keeps the default standard image tag at 0 on initialization', async () => {
    const sliceModule = await import('../../slice');
    const state = sliceModule.default(undefined, initAction);

    expect(state.config.imageTag).toBe('0');
  });

  it('defers saved configuration restoration until after initial render', async () => {
    localStorage.setItem('docker-compose-config-version', '2.13');
    localStorage.setItem('docker-compose-config', JSON.stringify({
      enabledExecutors: ['claude'],
      workdirPath: '/saved/workspace'
    }));

    const sliceModule = await import('../../slice');
    const state = sliceModule.default(undefined, initAction);

    expect(state.config.workdirPath).not.toBe('/saved/workspace');
    expect(sliceModule.loadPersistedConfig()?.workdirPath).toBe('/saved/workspace');
  });

  it('normalizes legacy copilot tags and removes deleted executor fields during restoration', async () => {
    localStorage.setItem('docker-compose-config-version', '2.7');
    localStorage.setItem('docker-compose-config', JSON.stringify({
      enabledExecutors: ['claude', 'copilot-cli', 'codex', 'qodercli'],
      imageTag: '1.2.3-copilot',
      workdirPath: '/workspace/repos',
      codebuddyApiKey: 'cb-test-key',
      qoderPersonalAccessToken: 'qoder-pat-test'
    }));

    const sliceModule = await import('../../slice');
    const config = sliceModule.loadPersistedConfig();
    const persistedConfig = JSON.parse(localStorage.getItem('docker-compose-config') ?? '{}') as Record<string, unknown>;

    expect(config?.enabledExecutors).toEqual(['claude', 'codex']);
    expect(config?.imageTag).toBe('0');
    expect(config?.workdirPath).toBe('/workspace/repos');
    expect('codebuddyApiKey' in persistedConfig).toBe(false);
    expect('qoderPersonalAccessToken' in persistedConfig).toBe(false);
  });

  it('sanitizes legacy PostgreSQL-era configs back to SQLite-only state', async () => {
    localStorage.setItem('docker-compose-config-version', '2.11');
    localStorage.setItem('docker-compose-config', JSON.stringify({
      profile: 'full-custom',
      enabledExecutors: ['claude'],
      anthropicAuthToken: 'saved-token',
      workdirPath: '/workspace/repos',
      databaseType: 'external',
      externalDbHost: 'legacy-db.example.com',
      externalDbPort: '5432',
      postgresDatabase: 'hagicode',
      postgresUser: 'postgres',
      postgresPassword: 'postgres',
      volumeType: 'named',
      volumeName: 'postgres-data'
    }));

    const sliceModule = await import('../../slice');
    const config = sliceModule.loadPersistedConfig();
    const persistedConfig = JSON.parse(localStorage.getItem('docker-compose-config') ?? '{}') as Record<string, unknown>;

    expect(config?.databaseType).toBe('sqlite');
    expect('externalDbHost' in persistedConfig).toBe(false);
    expect('externalDbPort' in persistedConfig).toBe(false);
    expect('postgresDatabase' in persistedConfig).toBe(false);
    expect('postgresUser' in persistedConfig).toBe(false);
    expect('postgresPassword' in persistedConfig).toBe(false);
    expect('volumeType' in persistedConfig).toBe(false);
    expect('volumeName' in persistedConfig).toBe(false);
  });

  it('hydrates missing OpenCode persistence fields from defaults and updates the saved version', async () => {
    localStorage.setItem('docker-compose-config-version', '2.7');
    localStorage.setItem('docker-compose-config', JSON.stringify({
      enabledExecutors: ['opencode'],
      openCodeModel: 'openai/gpt-5',
      workdirPath: '/workspace/repos'
    }));

    const sliceModule = await import('../../slice');
    const config = sliceModule.loadPersistedConfig();

    expect(config?.enabledExecutors).toEqual(['opencode']);
    expect(config?.openCodeModel).toBe('openai/gpt-5');
    expect(config?.openCodeConfigMode).toBe('default-managed');
    expect(config?.openCodeConfigHostPath).toBe('');
    expect(localStorage.getItem('docker-compose-config-version')).toBe('2.13');
  });

  it('migrates a legacy registry in the persisted config to Docker Hub', async () => {
    localStorage.setItem('docker-compose-config-version', '2.12');
    localStorage.setItem('docker-compose-config', JSON.stringify({
      imageRegistry: ['aliyun', 'acr'].join('-'),
      workdirPath: '/workspace/repos'
    }));

    const sliceModule = await import('../../slice');
    const config = sliceModule.loadPersistedConfig();
    const persistedConfig = JSON.parse(localStorage.getItem('docker-compose-config') ?? '{}') as Record<string, unknown>;

    expect(config?.imageRegistry).toBe('docker-hub');
    expect(persistedConfig.imageRegistry).toBe('docker-hub');
    expect(localStorage.getItem('docker-compose-image-registry')).toBe('docker-hub');
  });

  it('migrates a legacy standalone registry preference to Docker Hub', async () => {
    localStorage.setItem('docker-compose-config-version', '2.13');
    localStorage.setItem('docker-compose-image-registry', ['aliyun', 'acr'].join('-'));

    const sliceModule = await import('../../slice');
    const config = sliceModule.loadPersistedConfig();

    expect(config?.imageRegistry).toBe('docker-hub');
    expect(localStorage.getItem('docker-compose-image-registry')).toBe('docker-hub');
  });
});
