import type { DockerComposeConfig } from '../../types';

/**
 * Create a mock Docker Compose configuration with default values
 * @param overrides Partial configuration to override defaults
 * @returns Complete Docker Compose configuration
 */
export function createMockConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  const defaults: DockerComposeConfig = {
    profile: 'quick-start',
    httpPort: '8080',
    containerName: 'hagicode',
    imageTag: 'latest',
    hostOS: 'linux',
    imageRegistry: 'docker-hub',
    aspNetEnvironment: 'Production',
    timezone: 'Asia/Shanghai',
    databaseType: 'internal',
    postgresDatabase: 'hagicode',
    postgresUser: 'postgres',
    postgresPassword: 'postgres',
    volumeType: 'named',
    volumeName: 'postgres-data',
    licenseKeyType: 'public',
    licenseKey: 'public-license-key',
    anthropicApiProvider: 'anthropic',
    anthropicAuthToken: 'test-token',
    anthropicUrl: '',
    workdirPath: '/home/user/repos',
    workdirCreatedByRoot: true,
    puid: '1000',
    pgid: '1000'
  };

  return { ...defaults, ...overrides };
}

/**
 * Create a quick-start profile configuration
 * @param overrides Partial configuration to override defaults
 * @returns Quick-start configuration
 */
export function createQuickStartConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    profile: 'quick-start',
    hostOS: 'linux',
    workdirCreatedByRoot: true,
    databaseType: 'internal',
    volumeType: 'named',
    ...overrides
  });
}

/**
 * Create a full-custom profile configuration
 * @param overrides Partial configuration to override defaults
 * @returns Full-custom configuration
 */
export function createFullCustomConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    profile: 'full-custom',
    ...overrides
  });
}

/**
 * Create a Windows deployment configuration
 * @param overrides Partial configuration to override defaults
 * @returns Windows configuration
 */
export function createWindowsConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    hostOS: 'windows',
    workdirPath: 'C:\\\\repos',
    workdirCreatedByRoot: true,
    ...overrides
  });
}

/**
 * Create a Linux non-root user configuration
 * @param overrides Partial configuration to override defaults
 * @returns Linux non-root configuration
 */
export function createLinuxNonRootConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    hostOS: 'linux',
    workdirCreatedByRoot: false,
    puid: '1000',
    pgid: '1000',
    ...overrides
  });
}

/**
 * Create an external database configuration
 * @param overrides Partial configuration to override defaults
 * @returns External database configuration
 */
export function createExternalDbConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    databaseType: 'external',
    externalDbHost: 'localhost',
    externalDbPort: '5432',
    ...overrides
  });
}

/**
 * Create a ZAI API provider configuration
 * @param overrides Partial configuration to override defaults
 * @returns ZAI provider configuration
 */
export function createZaiProviderConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    anthropicApiProvider: 'zai',
    ...overrides
  });
}

/**
 * Create an Anthropic API provider configuration
 * @param overrides Partial configuration to override defaults
 * @returns Anthropic provider configuration
 */
export function createAnthropicProviderConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    anthropicApiProvider: 'anthropic',
    ...overrides
  });
}

/**
 * Create a custom API provider configuration
 * @param overrides Partial configuration to override defaults
 * @returns Custom provider configuration
 */
export function createCustomProviderConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    anthropicApiProvider: 'custom',
    anthropicUrl: 'https://custom-api.example.com',
    ...overrides
  });
}

/**
 * Fixed date for consistent testing
 */
export const FIXED_DATE = new Date('2024-01-01T00:00:00Z');
