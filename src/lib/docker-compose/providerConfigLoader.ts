/**
 * Provider Configuration Loader
 *
 * Fetches and manages provider configurations from the docs repository.
 * Implements a three-tier fallback strategy:
 * 1. Try to fetch from docs repository (https://docs.hagicode.com/presets/claude-code/providers/)
 * 2. If fetch fails, use embedded backup configuration
 * 3. If that fails, use legacy hardcoded constants
 */

/**
 * Provider Preset Configuration Interface
 * Matches the JSON structure from the docs repository
 */
export interface ProviderPreset {
  /** Unique identifier for the provider */
  providerId: string;
  /** Display name of the provider */
  name: string;
  /** Description of the provider */
  description: string;
  /** Provider category (e.g., 'china-providers', 'official') */
  category: string;
  /** API URLs for different purposes */
  apiUrl: {
    codingPlanForAnthropic: string;
  };
  /** Whether this provider is recommended */
  recommended: boolean;
  /** Provider region (e.g., 'cn', 'us') */
  region?: string;
  /** Default models for each Claude model tier */
  defaultModels: {
    sonnet: string | null;
    opus: string | null;
    haiku: string | null;
  };
  /** List of supported model names */
  supportedModels?: string[];
  /** Features supported by the provider */
  features?: string[];
  /** Environment variable name for auth token */
  authTokenEnv?: string;
  /** Referral URL to get API key */
  referralUrl?: string;
  /** Documentation URL */
  documentationUrl?: string;
  /** Additional notes about the provider */
  notes?: string;
}

/**
 * Legacy hardcoded constants - used as final fallback
 */
const LEGACY_ZAI_API_URL = 'https://open.bigmodel.cn/api/anthropic';
const LEGACY_ALIYUN_API_URL = 'https://coding.dashscope.aliyuncs.com/apps/anthropic';

/**
 * Embedded backup configurations
 * These are copied from the docs repository to ensure the app works offline
 * or when the docs site is temporarily unavailable.
 *
 * IMPORTANT: When adding new providers to docs, update this backup data.
 * See documentation for synchronization process.
 */
const EMBEDDED_BACKUP: Record<string, ProviderPreset> = {
  zai: {
    providerId: 'zai',
    name: '智谱 AI',
    description: '智谱 AI 提供的 Claude API 兼容服务',
    category: 'china-providers',
    apiUrl: {
      codingPlanForAnthropic: 'https://open.bigmodel.cn/api/anthropic'
    },
    recommended: true,
    region: 'cn',
    defaultModels: {
      sonnet: 'glm-4.7',
      opus: 'glm-5',
      haiku: 'glm-4.5-air'
    },
    supportedModels: [
      'glm-4.7',
      'glm-5',
      'glm-4.5-air',
      'qwen3-coder-next',
      'qwen3-coder-plus'
    ],
    features: ['experimental-agent-teams'],
    authTokenEnv: 'ANTHROPIC_AUTH_TOKEN',
    referralUrl: 'https://www.bigmodel.cn/claude-code?ic=14BY54APZA',
    documentationUrl: 'https://open.bigmodel.cn/dev/api',
    notes: '需要从智谱 AI 平台获取 API Key'
  },
  aliyun: {
    providerId: 'aliyun',
    name: '阿里云 DashScope',
    description: '阿里云灵积平台提供的 Claude API 兼容服务',
    category: 'china-providers',
    apiUrl: {
      codingPlanForAnthropic: 'https://coding.dashscope.aliyuncs.com/apps/anthropic'
    },
    recommended: true,
    region: 'cn',
    defaultModels: {
      sonnet: 'glm-4.7',
      opus: 'glm-4.7',
      haiku: 'glm-4.7'
    },
    supportedModels: ['glm-4.7'],
    features: ['experimental-agent-teams'],
    authTokenEnv: 'ANTHROPIC_AUTH_TOKEN',
    referralUrl: 'https://www.aliyun.com/benefit/ai/aistar?userCode=vmx5szbq&clubBiz=subTask..12384055..10263..',
    documentationUrl: 'https://dashscope.aliyun.com',
    notes: '使用统一的 glm-4.7 模型适用于所有层级'
  },
  anthropic: {
    providerId: 'anthropic',
    name: 'Anthropic Official',
    description: '官方 Anthropic API',
    category: 'official',
    apiUrl: {
      codingPlanForAnthropic: 'https://api.anthropic.com'
    },
    recommended: false,
    region: 'us',
    defaultModels: {
      sonnet: null,
      opus: null,
      haiku: null
    },
    referralUrl: 'https://console.anthropic.com/',
    documentationUrl: 'https://docs.anthropic.com/',
    notes: '使用官方 Claude 模型，用户可自定义选择模型版本'
  },
  minimax: {
    providerId: 'minimax',
    name: 'MiniMax',
    description: 'MiniMax 提供的 Claude API 兼容服务',
    category: 'china-providers',
    apiUrl: {
      codingPlanForAnthropic: 'https://api.minimaxi.com/anthropic'
    },
    recommended: true,
    region: 'cn',
    defaultModels: {
      sonnet: 'MiniMax-M2.5',
      opus: 'MiniMax-M2.5',
      haiku: 'MiniMax-M2.5'
    },
    supportedModels: ['MiniMax-M2.5'],
    features: ['experimental-agent-teams'],
    authTokenEnv: 'ANTHROPIC_AUTH_TOKEN',
    referralUrl: 'https://platform.minimaxi.com/subscribe/coding-plan?code=8wNck4etDM&source=link',
    documentationUrl: 'https://www.minimaxi.com',
    notes: '使用统一的 MiniMax-M2.5 模型适用于所有层级'
  }
};

/**
 * Custom provider - manually added since it's not in docs presets
 * Allows users to specify their own API endpoint
 */
const CUSTOM_PROVIDER: ProviderPreset = {
  providerId: 'custom',
  name: '自定义 API 端点',
  description: '用户提供的自定义 API 端点',
  category: 'custom',
  apiUrl: { codingPlanForAnthropic: '' },
  recommended: false,
  defaultModels: {
    sonnet: null,
    opus: null,
    haiku: null
  },
  supportedModels: [],
  notes: '用户需要手动提供 API 端点 URL'
};

/**
 * Provider Configuration Loader Class
 *
 * Manages provider configuration loading, caching, and querying.
 * Implements graceful fallback from remote fetch to embedded backup to legacy.
 */
export class ProviderConfigLoader {
  private providers: Map<string, ProviderPreset> = new Map();
  private initialized = false;
  private baseUrl: string;

  constructor(baseUrl?: string) {
    // Use environment variable override if available, otherwise use default
    this.baseUrl = baseUrl || import.meta.env.VITE_PRESETS_BASE_URL || 'https://docs.hagicode.com';
  }

  /**
   * Initialize the loader by fetching provider configurations
   * @returns Promise that resolves when initialization is complete
   */
  async init(): Promise<void> {
    if (this.initialized) {
      console.log('[ProviderConfigLoader] Already initialized, skipping');
      return;
    }

    try {
      const presets = await this.fetchPresets();
      if (presets.length > 0) {
        console.log(`[ProviderConfigLoader] Successfully fetched ${presets.length} providers from docs repository`);
        presets.forEach(preset => this.providers.set(preset.providerId, preset));
      } else {
        throw new Error('No providers fetched from docs repository');
      }
    } catch (error) {
      console.warn('[ProviderConfigLoader] Failed to fetch from docs repository, using embedded backup:', error);
      // Fallback to embedded backup
      Object.values(EMBEDDED_BACKUP).forEach(preset => {
        this.providers.set(preset.providerId, preset);
      });
      console.log(`[ProviderConfigLoader] Loaded ${this.providers.size} providers from embedded backup`);
    }

    // Always add custom provider
    this.addCustomProvider();

    this.initialized = true;
  }

  /**
   * Fetch presets from the docs repository
   * @returns Promise that resolves to an array of provider presets
   */
  private async fetchPresets(): Promise<ProviderPreset[]> {
    const presetsUrl = `${this.baseUrl}/presets/claude-code/providers/`;

    // Fetch all available provider files
    const knownProviders = ['zai', 'aliyun', 'anthropic', 'minimax'];
    const fetchPromises = knownProviders.map(providerId =>
      this.fetchProviderPreset(`${presetsUrl}${providerId}.json`)
    );

    const results = await Promise.allSettled(fetchPromises);
    const validPresets: ProviderPreset[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        validPresets.push(result.value);
      } else {
        console.warn(`[ProviderConfigLoader] Failed to fetch provider ${knownProviders[index]}:`, result.reason);
      }
    });

    return validPresets;
  }

  /**
   * Fetch a single provider preset JSON file
   * @param url The URL to fetch
   * @returns Promise that resolves to the provider preset or null on failure
   */
  private async fetchProviderPreset(url: string): Promise<ProviderPreset | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      return this.transformToInternalFormat(json);
    } catch (error) {
      console.warn(`[ProviderConfigLoader] Failed to fetch ${url}:`, error);
      return null;
    }
  }

  /**
   * Transform external JSON format to internal configuration format
   * @param json The raw JSON from the docs repository
   * @returns The transformed provider preset
   */
  private transformToInternalFormat(json: unknown): ProviderPreset {
    // Validate required fields
    if (!json || typeof json !== 'object') {
      throw new Error('Invalid provider data: not an object');
    }

    const data = json as Record<string, unknown>;

    if (!data.providerId || typeof data.providerId !== 'string') {
      throw new Error('Invalid provider data: missing or invalid providerId');
    }

    if (!data.name || typeof data.name !== 'string') {
      throw new Error(`Invalid provider data ${data.providerId}: missing or invalid name`);
    }

    if (!data.apiUrl || typeof data.apiUrl !== 'object' || !data.apiUrl.codingPlanForAnthropic) {
      throw new Error(`Invalid provider data ${data.providerId}: missing or invalid apiUrl`);
    }

    // Construct provider preset with defaults for optional fields
    return {
      providerId: data.providerId as string,
      name: data.name as string,
      description: data.description as string || '',
      category: data.category as string || 'other',
      apiUrl: {
        codingPlanForAnthropic: (data.apiUrl as Record<string, string>).codingPlanForAnthropic
      },
      recommended: data.recommended === true,
      region: data.region as string | undefined,
      defaultModels: {
        sonnet: data.defaultModels?.sonnet as string | null ?? null,
        opus: data.defaultModels?.opus as string | null ?? null,
        haiku: data.defaultModels?.haiku as string | null ?? null
      },
      supportedModels: Array.isArray(data.supportedModels) ? data.supportedModels as string[] : undefined,
      features: Array.isArray(data.features) ? data.features as string[] : undefined,
      authTokenEnv: data.authTokenEnv as string | undefined,
      referralUrl: data.referralUrl as string | undefined,
      documentationUrl: data.documentationUrl as string | undefined,
      notes: data.notes as string | undefined
    };
  }

  /**
   * Add custom provider to the provider list
   * Custom provider is manually constructed since it's not in docs presets
   */
  private addCustomProvider(): void {
    this.providers.set(CUSTOM_PROVIDER.providerId, { ...CUSTOM_PROVIDER });
  }

  /**
   * Get all providers, sorted by recommendation status and order
   * Recommended providers first in the order: ZAI → MiniMax → Aliyun → others
   * @returns Array of all provider presets
   */
  getAllProviders(): ProviderPreset[] {
    if (!this.initialized) {
      console.warn('[ProviderConfigLoader] Not initialized, returning empty array');
      return [];
    }

    // Define the recommended order for providers
    const recommendedOrder = ['zai', 'minimax', 'aliyun'];

    return Array.from(this.providers.values()).sort((a, b) => {
      // Both recommended - use the defined order
      if (a.recommended && b.recommended && a.providerId !== 'custom' && b.providerId !== 'custom') {
        const aIndex = recommendedOrder.indexOf(a.providerId);
        const bIndex = recommendedOrder.indexOf(b.providerId);
        if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
        if (aIndex !== -1) return -1;
        if (bIndex !== -1) return 1;
      }
      // Recommended first
      if (a.recommended && !b.recommended) return -1;
      if (!a.recommended && b.recommended) return 1;
      // Custom always last
      if (a.providerId === 'custom') return 1;
      if (b.providerId === 'custom') return -1;
      // Then alphabetically by name for non-recommended
      return a.name.localeCompare(b.name, 'zh-CN');
    });
  }

  /**
   * Get a provider configuration by ID
   * @param providerId The provider ID
   * @returns The provider preset or undefined if not found
   */
  getProviderById(providerId: string): ProviderPreset | undefined {
    if (!this.initialized) {
      console.warn('[ProviderConfigLoader] Not initialized');
      return undefined;
    }

    return this.providers.get(providerId);
  }

  /**
   * Get the recommended provider
   * @returns The recommended provider or undefined if none is recommended
   */
  getRecommendedProvider(): ProviderPreset | undefined {
    if (!this.initialized) {
      console.warn('[ProviderConfigLoader] Not initialized');
      return undefined;
    }

    // Find the first provider marked as recommended
    for (const provider of this.providers.values()) {
      if (provider.recommended && provider.providerId !== 'custom') {
        return provider;
      }
    }

    // Fallback to zai if no provider is recommended
    return this.providers.get('zai');
  }

  /**
   * Check if the loader is initialized
   * @returns True if initialized, false otherwise
   */
  isReady(): boolean {
    return this.initialized;
  }

  /**
   * Get the base URL being used for fetching presets
   * @returns The base URL
   */
  getBaseUrl(): string {
    return this.baseUrl;
  }
}

/**
 * Singleton instance of the provider config loader
 */
let loaderInstance: ProviderConfigLoader | null = null;

/**
 * Get or create the singleton provider config loader instance
 * @param baseUrl Optional base URL override
 * @returns The singleton instance
 */
export function getProviderConfigLoader(baseUrl?: string): ProviderConfigLoader {
  if (!loaderInstance) {
    loaderInstance = new ProviderConfigLoader(baseUrl);
  }
  return loaderInstance;
}

/**
 * Initialize the provider config loader
 * @param baseUrl Optional base URL override
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeProviderConfig(baseUrl?: string): Promise<void> {
  const loader = getProviderConfigLoader(baseUrl);
  await loader.init();
}

/**
 * Get all providers from the initialized loader
 * @returns Array of provider presets
 */
export function getAllProviders(): ProviderPreset[] {
  const loader = getProviderConfigLoader();
  return loader.getAllProviders();
}

/**
 * Get a provider by ID from the initialized loader
 * @param providerId The provider ID
 * @returns The provider preset or undefined
 */
export function getProviderById(providerId: string): ProviderPreset | undefined {
  const loader = getProviderConfigLoader();
  return loader.getProviderById(providerId);
}

/**
 * Get the recommended provider from the initialized loader
 * @returns The recommended provider or undefined
 */
export function getRecommendedProvider(): ProviderPreset | undefined {
  const loader = getProviderConfigLoader();
  return loader.getRecommendedProvider();
}

/**
 * Check if the provider config loader is ready
 * @returns True if initialized
 */
export function isProviderConfigReady(): boolean {
  const loader = getProviderConfigLoader();
  return loader.isReady();
}

// Re-export for backward compatibility
export { LEGACY_ZAI_API_URL, LEGACY_ALIYUN_API_URL };