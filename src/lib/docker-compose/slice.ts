import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { DockerComposeConfig } from '../../lib/docker-compose/types';
import { defaultConfig } from '../../lib/docker-compose/defaultConfig';

// Configuration version - increment to invalidate old localStorage caches
const CONFIG_VERSION = '2.0';

interface DockerComposeState {
  config: DockerComposeConfig;
  isLoading: boolean;
  error: string | null;
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
      return { ...defaultConfig, ...JSON.parse(savedConfig) };
    }

    const savedRegistry = localStorage.getItem('docker-compose-image-registry');
    if (savedRegistry && (savedRegistry === 'docker-hub' || savedRegistry === 'azure-acr')) {
      return {
        ...defaultConfig,
        imageRegistry: savedConfig as DockerComposeConfig['imageRegistry']
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
};

const dockerComposeSlice = createSlice({
  name: 'dockerCompose',
  initialState,
  reducers: {
    updateConfig: (state, action: PayloadAction<Partial<DockerComposeConfig>>) => {
      state.config = { ...state.config, ...action.payload };

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
  },
});

export const {
  updateConfig,
  resetConfig,
  setConfigField,
  setLoading,
  setError,
  clearError,
} = dockerComposeSlice.actions;

export default dockerComposeSlice.reducer;

// Selectors
export const selectConfig = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.config;

export const selectIsLoading = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.isLoading;

export const selectError = (state: { dockerCompose: DockerComposeState }) =>
  state.dockerCompose.error;
