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
    enabledExecutors: ['claude'],
    httpPort: '8080',
    enableHttps: false,
    httpsPort: '443',
    lanIp: '192.168.1.100',
    containerName: 'hagicode',
    imageTag: '0',
    hostOS: 'linux',
    imageRegistry: 'docker-hub',
    aspNetEnvironment: 'Production',
    timezone: 'Asia/Shanghai',
    databaseType: 'sqlite',
    licenseKeyType: 'public',
    licenseKey: 'public-license-key',
    anthropicApiProvider: 'anthropic',
    anthropicAuthToken: 'test-token',
    anthropicUrl: '',
    codexApiKey: '',
    codexBaseUrl: undefined,
    openCodeModel: 'anthropic/claude-sonnet-4',
    openCodeConfigMode: 'default-managed',
    openCodeConfigHostPath: '',
    openCodeAuthHostPath: '',
    openCodeModelsHostPath: '',
    acceptEula: false,
    enableCodeServer: true,
    codeServerHost: '127.0.0.1',
    codeServerPort: '36529',
    codeServerPublishToHost: false,
    codeServerPublishedPort: '36529',
    codeServerAuthMode: 'none',
    codeServerPassword: '',
    workdirPath: '/home/user/repos',
    workdirCreatedByRoot: true,
    puid: '1000',
    pgid: '1000',
    anthropicSonnetModel: undefined,
    anthropicOpusModel: undefined,
    anthropicHaikuModel: undefined,
    claudeCodeExperimentalAgentTeams: false
  };

  return { ...defaults, ...overrides };
}

export function createQuickStartConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    profile: 'quick-start',
    hostOS: 'linux',
    workdirCreatedByRoot: true,
    ...overrides
  });
}

export function createFullCustomConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    profile: 'full-custom',
    ...overrides
  });
}

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

export function createZaiProviderConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    anthropicApiProvider: 'zai',
    ...overrides
  });
}

export function createAnthropicProviderConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    anthropicApiProvider: 'anthropic',
    ...overrides
  });
}

export function createCustomProviderConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    anthropicApiProvider: 'custom',
    anthropicUrl: 'https://custom-api.example.com',
    ...overrides
  });
}

export function createOpenCodeConfig(
  overrides: Partial<DockerComposeConfig> = {}
): DockerComposeConfig {
  return createMockConfig({
    enabledExecutors: ['opencode'],
    anthropicAuthToken: '',
    openCodeModel: 'anthropic/claude-sonnet-4',
    ...overrides
  });
}

export const FIXED_DATE = new Date('2024-01-01T00:00:00Z');
