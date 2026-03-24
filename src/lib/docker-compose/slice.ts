import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DockerComposeConfig, ExecutorType } from '../../lib/docker-compose/types';
import type { ProviderPreset } from '../../lib/docker-compose/providerConfigLoader';
import { defaultConfig } from '../../lib/docker-compose/defaultConfig';

// Configuration version - increment to invalidate old localStorage caches
const CONFIG_VERSION = '2.9';
const LEGACY_COPILOT_IMAGE_TAG_REGEX = /^v?\d+\.\d+\.\d+([-.][0-9A-Za-z.-]+)?-copilot$/;

const EXECUTOR_OPTIONS: readonly ExecutorType[] = [
  'claude',
  'codex',
  'opencode'
];

interface LegacyDockerComposeConfig extends Partial<DockerComposeConfig> {
  runtimeProvider?: unknown;
  defaultExecutor?: unknown;
  codebuddyApiKey?: unknown;
  codebuddyInternetEnvironment?: unknown;
  kimiExecutablePath?: unknown;
  kimiStateMountPath?: unknown;
  copilotApiKey?: unknown;
  copilotBaseUrl?: unknown;
  copilotMountWorkspace?: unknown;
  qoderPersonalAccessToken?: unknown;
  kiroExecutablePath?: unknown;
  kiroStateMountPath?: unknown;
}

const isExecutorType = (value: unknown): value is ExecutorType =>
  typeof value === 'string' && EXECUTOR_OPTIONS.includes(value as ExecutorType);

const isOpenCodeConfigMode = (value: unknown): value is DockerComposeConfig['openCodeConfigMode'] =>
  value === 'default-managed' || value === 'host-file';

const normalizeExecutorConfig = (config: LegacyDockerComposeConfig): DockerComposeConfig => {
  const normalizedEnabled = Array.isArray(config.enabledExecutors)
    ? (config.enabledExecutors as string[])
      .filter(isExecutorType)
    : [];
  const enabledExecutors = normalizedEnabled.length > 0
    ? Array.from(new Set(normalizedEnabled))
    : [...defaultConfig.enabledExecutors];
  const {
    runtimeProvider: _legacyRuntimeProvider,
    defaultExecutor: _legacyDefaultExecutor,
    codebuddyApiKey: _legacyCodeBuddyApiKey,
    codebuddyInternetEnvironment: _legacyCodeBuddyInternetEnvironment,
    kimiExecutablePath: _legacyKimiExecutablePath,
    kimiStateMountPath: _legacyKimiStateMountPath,
    copilotApiKey: _legacyCopilotApiKey,
    copilotBaseUrl: _legacyCopilotBaseUrl,
    copilotMountWorkspace: _legacyCopilotMountWorkspace,
    qoderPersonalAccessToken: _legacyQoderPersonalAccessToken,
    kiroExecutablePath: _legacyKiroExecutablePath,
    kiroStateMountPath: _legacyKiroStateMountPath,
    ...rest
  } = config;

  const normalizedConfig: DockerComposeConfig = {
    ...defaultConfig,
    ...rest,
    enabledExecutors
  };

  return {
    ...normalizedConfig,
    openCodeConfigMode: isOpenCodeConfigMode(normalizedConfig.openCodeConfigMode)
      ? normalizedConfig.openCodeConfigMode
      : defaultConfig.openCodeConfigMode,
    openCodeConfigHostPath: normalizedConfig.openCodeConfigHostPath ?? defaultConfig.openCodeConfigHostPath,
    openCodeAuthHostPath: normalizedConfig.openCodeAuthHostPath ?? defaultConfig.openCodeAuthHostPath,
    openCodeModelsHostPath: normalizedConfig.openCodeModelsHostPath ?? defaultConfig.openCodeModelsHostPath,
  };
};

const normalizeStandardImageTag = (config: DockerComposeConfig): DockerComposeConfig => {
  if (!LEGACY_COPILOT_IMAGE_TAG_REGEX.test(config.imageTag.trim())) {
    return config;
  }

  return {
    ...config,
    imageTag: defaultConfig.imageTag
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
    const savedConfig = localStorage.getItem('docker-compose-config');
    if (savedConfig) {
      const normalizedConfig = normalizeStandardImageTag(
        normalizeExecutorConfig(JSON.parse(savedConfig) as LegacyDockerComposeConfig)
      );

      if (savedVersion !== CONFIG_VERSION) {
        console.log('Config version mismatch, migrating saved config to current defaults');
      }

      localStorage.setItem('docker-compose-config-version', CONFIG_VERSION);
      localStorage.setItem('docker-compose-config', JSON.stringify(normalizedConfig));
      localStorage.setItem('docker-compose-image-registry', normalizedConfig.imageRegistry);

      return normalizedConfig;
    }

    if (savedVersion !== CONFIG_VERSION) {
      console.log('Config version mismatch, resetting to defaults');
      localStorage.setItem('docker-compose-config-version', CONFIG_VERSION);
      localStorage.setItem('docker-compose-image-registry', defaultConfig.imageRegistry);
      localStorage.removeItem('docker-compose-config');
      return { ...defaultConfig };
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
  providersError: null
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

      if (field === 'profile') {
        state.config = normalizeStandardImageTag(state.config);
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
    }
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
  setProviders
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
