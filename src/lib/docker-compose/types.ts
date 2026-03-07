/**
 * Docker Compose Generator Type Definitions
 * Migrated from pcode-docs project
 */

export type DatabaseType = 'sqlite' | 'internal' | 'external';
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
 * Runtime AI Provider Type
 * Top-level provider selection for Docker Compose configuration
 *
 * - claude: Uses Anthropic-compatible API providers (Anthropic/ZAI/Aliyun/MiniMax/Volcengine/Custom)
 * - codex: Uses Codex runtime with CODEX_* environment variables
 */
export type RuntimeProvider = 'claude' | 'codex';

/**
 * Anthropic API Provider Type
 * Unified use of ANTHROPIC_AUTH_TOKEN environment variable
 * Different providers are distinguished by ANTHROPIC_URL
 *
 * Note: This is now a string type to allow for dynamic provider configurations
 * from the docs repository. Previously hardcoded as 'anthropic' | 'zai' | 'aliyun' | 'custom'
 *
 * - anthropic: Anthropic official API (only needs ANTHROPIC_AUTH_TOKEN)
 * - zai: Zhipu AI (uses ANTHROPIC_AUTH_TOKEN + preset ANTHROPIC_URL)
 * - aliyun: Aliyun DashScope (uses ANTHROPIC_AUTH_TOKEN + preset ANTHROPIC_URL)
 * - minimax: MiniMax (uses ANTHROPIC_AUTH_TOKEN + preset ANTHROPIC_URL)
 * - volcengine: Volcengine (uses ANTHROPIC_AUTH_TOKEN + preset ANTHROPIC_URL)
 * - custom: Custom API (uses ANTHROPIC_AUTH_TOKEN + ANTHROPIC_URL)
 */
export type AnthropicApiProvider = string;

/**
 * Provider Preset Configuration Interface
 * Matches the JSON structure from the docs repository
 * Re-exported from providerConfigLoader for convenience
 */
export type { ProviderPreset } from './providerConfigLoader';

// Legacy hardcoded constants - kept for backward compatibility in fallback paths
// These are now primarily used in the embedded backup configuration
// New code should use ProviderConfigLoader to get these values
export const ZAI_API_URL = 'https://open.bigmodel.cn/api/anthropic';
export const ALIYUN_API_URL = 'https://coding.dashscope.aliyuncs.com/apps/anthropic';
export const VOLCENGINE_API_URL = 'https://ark.cn-beijing.volces.com/api/coding';

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

  // Runtime AI Provider
  /** Top-level AI provider selection (claude or codex) */
  runtimeProvider: RuntimeProvider;

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

  // Anthropic API Configuration (used when runtimeProvider = 'claude')
  /** Anthropic API provider selection */
  anthropicApiProvider: AnthropicApiProvider;
  /** Anthropic API Token (used by all Claude providers) */
  anthropicAuthToken: string;
  /** API Endpoint URL (used by zai/custom providers) */
  anthropicUrl: string;

  // Codex Runtime Configuration (used when runtimeProvider = 'codex')
  /** Codex API Key (required) */
  codexApiKey: string;
  /** Codex Base URL (optional) */
  codexBaseUrl?: string;

  // Volume mounts
  workdirPath: string;
  workdirCreatedByRoot: boolean;

  // Advanced
  puid: string;
  pgid: string;

  // Claude Code Extended Configuration (optional)
  /** Anthropic Sonnet model version (optional) */
  anthropicSonnetModel?: string;
  /** Anthropic Opus model version (optional) */
  anthropicOpusModel?: string;
  /** Anthropic Haiku model version (optional) */
  anthropicHaikuModel?: string;
  /** Enable experimental Agent Teams feature (optional) */
  claudeCodeExperimentalAgentTeams?: boolean;
}
