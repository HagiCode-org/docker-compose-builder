/**
 * Docker Compose Generator Type Definitions
 * Migrated from pcode-docs project
 */

export type DatabaseType = 'internal' | 'external';
export type HostOS = 'windows' | 'linux';
export type LicenseKeyType = 'public' | 'custom';
export type VolumeType = 'named' | 'bind';
export type ImageRegistry = 'docker-hub' | 'azure-acr' | 'aliyun-acr';

/**
 * Configuration Profile Type
 * Determines the level of configuration complexity exposed to users
 *
 * - quick-start: Simplified mode with minimal configuration options for new users
 * - full-custom: Complete control over all configuration parameters for advanced users
 */
export type ConfigProfile = 'quick-start' | 'full-custom';

/**
 * Anthropic API Provider Type
 * Unified use of ANTHROPIC_AUTH_TOKEN environment variable
 * Different providers are distinguished by ANTHROPIC_URL
 *
 * - anthropic: Anthropic official API (only needs ANTHROPIC_AUTH_TOKEN)
 * - zai: Zhipu AI (uses ANTHROPIC_AUTH_TOKEN + preset ANTHROPIC_URL)
 * - custom: Custom API (uses ANTHROPIC_AUTH_TOKEN + ANTHROPIC_URL)
 */
export type AnthropicApiProvider = 'anthropic' | 'zai' | 'custom';

// ZAI API URL constant
export const ZAI_API_URL = 'https://open.bigmodel.cn/api/anthropic';

/**
 * Image Registry Configuration Interface
 */
export interface RegistryConfig {
  id: ImageRegistry;
  name: string;
  description: string;
  imagePrefix: string;
  recommended: boolean;
  networkAdvice: string;
}

/**
 * Image Registry Configuration Constants
 */
export const REGISTRIES: Record<ImageRegistry, RegistryConfig> = {
  'aliyun-acr': {
    id: 'aliyun-acr',
    name: '阿里云 ACR',
    description: '阿里云容器镜像服务，国内用户推荐',
    imagePrefix: 'registry.cn-hangzhou.aliyuncs.com/hagicode',
    recommended: true,
    networkAdvice: '适合中国大陆用户，提供稳定的镜像加速服务'
  },
  'docker-hub': {
    id: 'docker-hub',
    name: 'Docker Hub',
    description: 'Docker official image registry, recommended',
    imagePrefix: 'newbe36524/hagicode',
    recommended: false,
    networkAdvice: 'Suitable for users with Docker Hub mirror acceleration support'
  },
  'azure-acr': {
    id: 'azure-acr',
    name: 'Azure Container Registry',
    description: 'Alternative image registry, synced with Docker Hub',
    imagePrefix: 'hagicode.azurecr.io/hagicode',
    recommended: false,
    networkAdvice: 'Suitable for users who cannot access Docker Hub locally'
  }
};

/**
 * Docker Compose Configuration Interface
 */
export interface DockerComposeConfig {
  // Configuration Profile
  profile: ConfigProfile;

  // Basic settings
  httpPort: string;
  containerName: string;
  imageTag: string;
  hostOS: HostOS;
  imageRegistry: ImageRegistry;

  // Environment (fixed)
  aspNetEnvironment: 'Production';
  timezone: 'Asia/Shanghai';

  // Database
  databaseType: DatabaseType;
  postgresDatabase: string;
  postgresUser: string;
  postgresPassword: string;
  externalDbHost?: string;
  externalDbPort?: string;
  volumeType: VolumeType;
  volumeName?: string;
  volumePath?: string;

  // API Keys
  licenseKeyType: LicenseKeyType;
  licenseKey: string;

  // Anthropic API Configuration
  /** Anthropic API provider selection */
  anthropicApiProvider: AnthropicApiProvider;
  /** Anthropic API Token (used by all providers) */
  anthropicAuthToken: string;
  /** API Endpoint URL (used by zai/custom providers) */
  anthropicUrl: string;

  // Volume mounts
  workdirPath: string;
  workdirCreatedByRoot: boolean;

  // Advanced
  puid: string;
  pgid: string;
}
