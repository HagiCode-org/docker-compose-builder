import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DockerComposeConfig, ExecutorType, RuntimeProvider } from '../../lib/docker-compose/types';
import type { ProviderPreset } from '../../lib/docker-compose/providerConfigLoader';
import { defaultConfig } from '../../lib/docker-compose/defaultConfig';

// Configuration version - increment to invalidate old localStorage caches
const CONFIG_VERSION = '2.3';

const EXECUTOR_OPTIONS: readonly ExecutorType[] = ['claude', 'codex'];

interface LegacyDockerComposeConfig extends Partial<DockerComposeConfig> {
  runtimeProvider?: RuntimeProvider;
}

const isExecutorType = (value: unknown): value is ExecutorType =>
  typeof value === 'string' && EXECUTOR_OPTIONS.includes(value as ExecutorType);

const normalizeExecutorConfig = (config: LegacyDockerComposeConfig): DockerComposeConfig => {
  const merged = { ...defaultConfig, ...config } as DockerComposeConfig;

  // Legacy migration: map runtimeProvider into new dual-layer fields when missing.
  const normalizedEnabled = Array.isArray(config.enabledExecutors)
    ? config.enabledExecutors.filter(isExecutorType)
    : [];
  const legacyRuntime = isExecutorType(config.runtimeProvider) ? config.runtimeProvider : undefined;
  const fallbackExecutor = legacyRuntime ?? defaultConfig.defaultExecutor;
  const enabledExecutors = normalizedEnabled.length > 0 ? Array.from(new Set(normalizedEnabled)) : [fallbackExecutor];
  const requestedDefault = isExecutorType(config.defaultExecutor) ? config.defaultExecutor : fallbackExecutor;
  const defaultExecutor = enabledExecutors.includes(requestedDefault) ? requestedDefault : enabledExecutors[0];

  return {
    ...merged,
    enabledExecutors,
    defaultExecutor,
    runtimeProvider: undefined
  };
};

interface DockerComposeState {
  config: DockerComposeConfig;
  isLoading: boolean;
  error: string | null;
  // Provider configuration state
  providers: ProviderPreset[];
  providersLoading: boolean;
  providersError: string | null;
}

const getInitialConfig = (): DockerComposeConfig => {
  if (typeof window === 'undefined') {
    return { ...defaultConfig };
  }

  try {
    const savedVersion = localStorage.getItem('docker-compose-config-version');

    // If version doesn't match, clear old config and use new defaults
    if (savedVersion !== CONFIG_VERSION) {
      console.log('Config version mismatch, resetting to defaults');
      localStorage.setItem('docker-compose-config-version', CONFIG_VERSION);
      localStorage.removeItem('docker-compose-config');
      localStorage.setItem('docker-compose-image-registry', defaultConfig.imageRegistry);
      return { ...defaultConfig };
    }

    const savedConfig = localStorage.getItem('docker-compose-config');
    if (savedConfig) {
      return normalizeExecutorConfig(JSON.parse(savedConfig) as LegacyDockerComposeConfig);
    }

    const savedRegistry = localStorage.getItem('docker-compose-image-registry');
    if (savedRegistry && (savedRegistry === 'docker-hub' || savedRegistry === 'azure-acr' || savedRegistry === 'aliyun-acr')) {
      return {
        ...defaultConfig,
        imageRegistry: savedRegistry as DockerComposeConfig['imageRegistry']
      };
    }
  } catch (error) {
    console.warn('Failed to read from localStorage:', error);
  }

  return { ...defaultConfig };
};

const initialState: DockerComposeState = {
  config: getInitialConfig(),
  isLoading: false,
  error: null,
  providers: [],
  providersLoading: false,
  providersError: null,
};

const dockerComposeSlice = createSlice({
  name: 'dockerCompose',
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<Partial<DockerComposeConfig>>) => {
      state.config = normalizeExecutorConfig({ ...state.config, ...action.payload });

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('docker-compose-config-version', CONFIG_VERSION);
          localStorage.setItem('docker-compose-config', JSON.stringify(state.config));
          localStorage.setItem('docker-compose-image-registry', state.config.imageRegistry);
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      }
    },

    resetConfig: (state) => {
      state.config = { ...defaultConfig };

      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem('docker-compose-config');
          localStorage.setItem('docker-compose-image-registry', defaultConfig.imageRegistry);
        } catch (error) {
          console.warn('Failed to clear localStorage:', error);
        }
      }
    },

    setConfigField: <K extends keyof DockerComposeConfig>(
      state: DockerComposeState,
      action: PayloadAction<{ field: K; value: DockerComposeConfig[K] }>
    ) => {
      const { field, value } = action.payload;
      state.config[field] = value;
      state.config = normalizeExecutorConfig(state.config);

      // Auto-reset database type to SQLite when switching to quick-start profile
      if (field === 'profile' && value === 'quick-start') {
        state.config.databaseType = 'sqlite';
      }

      // Save to localStorage
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('docker-compose-config-version', CONFIG_VERSION);
          localStorage.setItem('docker-compose-config', JSON.stringify(state.config));
          if (field === 'imageRegistry') {
            localStorage.setItem('docker-compose-image-registry', value as string);
          }
        } catch (error) {
          console.warn('Failed to save to localStorage:', error);
        }
      }
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Provider configuration actions
    setProvidersLoading: (state, action: PayloadAction<boolean>) => {
      state.providersLoading = action.payload;
    },

    setProvidersError: (state, action: PayloadAction<string | null>) => {
      state.providersError = action.payload;
    },

    setProviders: (state, action: PayloadAction<ProviderPreset[]>) => {
      state.providers = action.payload;
      state.providersLoading = false;
      state.providersError = null;
    },
  },
});

export const {
  updateConfig,
  resetConfig,
  setConfigField,
  setLoading,
  setError,
  clearError,
  setProvidersLoading,
  setProvidersError,
  setProviders,
} = dockerComposeSlice.actions;

export default dockerComposeSlice.reducer;

// Selectors
export const selectConfig = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.config;

export const selectIsLoading = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.isLoading;

export const selectError = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.error;

// Provider configuration selectors
export const selectProviders = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.providers;

export const selectProvidersLoading = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.providersLoading;

export const selectProvidersError = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.providersError;

export const selectProviderById = (state: { dockerCompose: DockerComposeState }, providerId: string) =>
  state.dockerCompose.providers.find(p => p.providerId === providerId);
