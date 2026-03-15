import type { DockerComposeConfig } from './types';
import type { ProviderPreset } from './providerConfigLoader';
import { REGISTRIES, ZAI_API_URL, ALIYUN_API_URL, VOLCENGINE_API_URL } from './types';

/**
 * Get provider API URL for Docker Compose generation
 * Supports both dynamic provider configuration and legacy fallback
 * @param providerId The provider ID
 * @param providerConfig Optional provider configuration from ProviderConfigLoader
 * @param customUrl Optional custom URL from user input
 * @returns The API URL or null if not applicable
 */
function getProviderApiUrl(
  providerId: string,
  providerConfig?: ProviderPreset,
  customUrl?: string
): string | null {
  // For custom provider, use the user-provided URL
  if (providerId === 'custom') {
    return customUrl && customUrl.trim() ? customUrl : null;
  }

  // For Anthropic official, no API URL needed (uses default endpoint)
  if (providerId === 'anthropic') {
    return null;
  }

  // If provider configuration is available, use it
  if (providerConfig && providerConfig.apiUrl?.codingPlanForAnthropic) {
    return providerConfig.apiUrl.codingPlanForAnthropic;
  }

  // Legacy fallback for known providers
  switch (providerId) {
    case 'zai':
      return ZAI_API_URL;
    case 'aliyun':
      return ALIYUN_API_URL;
    case 'volcengine':
      return VOLCENGINE_API_URL;
    default:
      return null;
  }
}

/**
 * Get provider display name for comments in Docker Compose
 * @param providerId The provider ID
 * @param providerConfig Optional provider configuration
 * @returns The provider display name
 */
function getProviderDisplayName(providerId: string, providerConfig?: ProviderPreset): string {
  // Legacy fallback for backward compatibility with existing tests
  switch (providerId) {
    case 'anthropic':
      return 'Anthropic Official';
    case 'zai':
      return 'Zhipu AI (ZAI)';
    case 'aliyun':
      return 'Aliyun DashScope';
    case 'custom':
      return 'Custom Endpoint';
    case 'minimax':
      return 'MiniMax';
    case 'volcengine':
      return '火山引擎 Coding Plan';
    default:
      return providerConfig?.name || providerId;
  }
}

/**
 * Get provider description for comments in Docker Compose
 * @param providerId The provider ID
 * @param providerConfig Optional provider configuration
 * @returns The provider description
 */
function getProviderDescription(_providerId: string, providerConfig?: ProviderPreset): string | null {
  if (providerConfig && providerConfig.description) {
    return providerConfig.description;
  }
  return null;
}

function isExecutorEnabled(config: DockerComposeConfig, executor: DockerComposeConfig['enabledExecutors'][number]): boolean {
  return Array.isArray(config.enabledExecutors) && config.enabledExecutors.includes(executor);
}

/**
 * Build provider environment variables based on enabled executors.
 * Claude and Codex can be emitted together when both are enabled.
 * @param config The configuration object
 * @param providerConfig Optional provider configuration (for Claude branch)
 * @returns Array of provider environment variable lines
 */
function buildProviderEnvVars(
  config: DockerComposeConfig,
  providerConfig?: ProviderPreset
): string[] {
  const lines: string[] = [];

  if (isExecutorEnabled(config, 'codex')) {
    // Codex runtime configuration
    lines.push('      # ==================================================');
    lines.push('      # Codex Runtime Configuration');
    lines.push('      # Uses CODEX_* environment variables');
    lines.push('      # OPENAI_* variables are accepted as compatibility aliases');
    lines.push('      # ==================================================');

    if (config.codexApiKey) {
      lines.push(`      CODEX_API_KEY: "${config.codexApiKey}"`);
      lines.push('      # Compatibility alias: OPENAI_API_KEY = CODEX_API_KEY');
    }

    if (config.codexBaseUrl && config.codexBaseUrl.trim()) {
      lines.push(`      CODEX_BASE_URL: "${config.codexBaseUrl}"`);
      lines.push('      # Compatibility alias: OPENAI_BASE_URL = CODEX_BASE_URL');
    } else {
      lines.push('      # CODEX_BASE_URL: optional, uses default if not set');
      lines.push('      # Compatibility alias: OPENAI_BASE_URL = CODEX_BASE_URL');
    }
  }

  if (isExecutorEnabled(config, 'copilot-cli')) {
    lines.push('      # ==================================================');
    lines.push('      # Copilot CLI Runtime Configuration');
    lines.push('      # Uses COPILOT_* environment variables');
    lines.push('      # ==================================================');

    if (config.copilotApiKey) {
      lines.push(`      COPILOT_API_KEY: "${config.copilotApiKey}"`);
    }

    if (config.copilotBaseUrl && config.copilotBaseUrl.trim()) {
      lines.push(`      COPILOT_BASE_URL: "${config.copilotBaseUrl}"`);
    } else {
      lines.push('      # COPILOT_BASE_URL: optional, uses default if not set');
    }
  }

  if (isExecutorEnabled(config, 'codebuddy-cli')) {
    lines.push('      # ==================================================');
    lines.push('      # CodeBuddy CLI Runtime Configuration');
    lines.push('      # Uses explicit provider/bootstrap registration plus CODEBUDDY_* runtime variables');
    lines.push('      # ==================================================');
    lines.push('      AI__Providers__Providers__CodebuddyCli__Enabled: "true"');
    lines.push('      AI__Providers__Providers__CodebuddyCli__Type: "CodebuddyCli"');
    lines.push('      AI__Providers__Providers__CodebuddyCli__ExecutablePath: "codebuddy"');
    lines.push('      AI__PlatformConfigurations__CodebuddyCli__ExecutablePath: "codebuddy"');
    lines.push('      AI__PlatformConfigurations__CodebuddyCli__Arguments: "--acp"');

    if (config.codebuddyApiKey && config.codebuddyApiKey.trim()) {
      lines.push(`      CODEBUDDY_API_KEY: "${config.codebuddyApiKey}"`);
    }

    if (config.codebuddyInternetEnvironment && config.codebuddyInternetEnvironment.trim()) {
      lines.push(`      CODEBUDDY_INTERNET_ENVIRONMENT: "${config.codebuddyInternetEnvironment}"`);
    }
  }

  if (isExecutorEnabled(config, 'iflow-cli')) {
    lines.push('      # ==================================================');
    lines.push('      # IFlow CLI Runtime Configuration');
    lines.push('      # Uses explicit ACP bootstrap keys and relies on prior CLI login or mounted runtime state');
    lines.push('      # ==================================================');
    lines.push('      AI__Providers__Providers__IFlowCli__Enabled: "true"');
    lines.push('      AI__Providers__Providers__IFlowCli__Type: "IFlowCli"');
    lines.push('      AI__Providers__Providers__IFlowCli__ExecutablePath: "iflow"');
    lines.push('      AI__PlatformConfigurations__IFlowCli__ProviderName: "IFlowCli"');
    lines.push('      AI__PlatformConfigurations__IFlowCli__ExecutablePath: "iflow"');
    lines.push('      AI__PlatformConfigurations__IFlowCli__Arguments: "--experimental-acp --port {port}"');
    lines.push('      AI__PlatformConfigurations__IFlowCli__AuthMethod: "iflow"');
  }

  if (isExecutorEnabled(config, 'opencode')) {
    lines.push('      # ==================================================');
    lines.push('      # OpenCode Runtime Configuration');
    lines.push('      # Uses the managed OpenCode runtime contract baked into the unified image');
    lines.push('      # ==================================================');
    lines.push('      AI__Providers__Providers__OpenCodeCli__Enabled: "true"');
    lines.push('      AI__Providers__Providers__OpenCodeCli__Type: "OpenCodeCli"');
    lines.push('      AI__Providers__Providers__OpenCodeCli__ExecutablePath: "opencode"');
    lines.push('      AI__OpenCode__Enabled: "true"');
    lines.push('      AI__OpenCode__ExecutablePath: "opencode"');
    if (config.openCodeModel && config.openCodeModel.trim()) {
      lines.push(`      AI__OpenCode__Model: "${config.openCodeModel}"`);
    }
  }

  if (isExecutorEnabled(config, 'claude')) {
    // Claude runtime configuration
    if (!config.anthropicAuthToken) {
      return lines;
    }

    const providerId = config.anthropicApiProvider;
    const apiUrl = getProviderApiUrl(providerId, providerConfig, config.anthropicUrl);

    lines.push('      # ==================================================');
    lines.push('      # Claude Runtime Configuration');
    lines.push('      # All providers use ANTHROPIC_AUTH_TOKEN');
    lines.push('      # ANTHROPIC_URL is set for ZAI, Aliyun, and custom providers');
    lines.push('      # ==================================================');

    // Legacy behavior for backward compatibility with existing tests
    if (providerId === 'anthropic') {
      lines.push('      # Anthropic Official API');
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push('      # No ANTHROPIC_URL needed - uses default Anthropic endpoint');
    } else if (providerId === 'zai') {
      lines.push('      # Zhipu AI (ZAI) - uses Anthropic-compatible API');
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      lines.push('      # API Provider: Zhipu AI (ZAI)');
    } else if (providerId === 'aliyun') {
      lines.push('      # Aliyun DashScope - uses Anthropic-compatible API');
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      lines.push('      # API Provider: Aliyun DashScope');
      lines.push('      # Model mapping (unified configuration):');
      lines.push('      #   Haiku  → glm-4.7  (Unified model for all tiers)');
      lines.push('      #   Sonnet → glm-4.7  (Unified model for all tiers)');
      lines.push('      #   Opus   → glm-4.7  (Unified model for all tiers)');
    } else if (providerId === 'volcengine') {
      lines.push('      # 火山引擎 Coding Plan - uses Anthropic-compatible API');
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      lines.push('      # API Provider: 火山引擎 Coding Plan');
      lines.push('      # Model mapping (unified configuration):');
      lines.push('      #   Haiku  → glm-4.7  (Unified model for all tiers)');
      lines.push('      #   Sonnet → glm-4.7  (Unified model for all tiers)');
      lines.push('      #   Opus   → glm-4.7  (Unified model for all tiers)');
    } else if (providerId === 'custom') {
      lines.push('      # Custom Anthropic-compatible API');
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      if (apiUrl) {
        lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      }
      lines.push('      # API Provider: Custom Endpoint');
    } else {
      // New providers from dynamic configuration
      const displayName = getProviderDisplayName(providerId, providerConfig);
      const description = getProviderDescription(providerId, providerConfig);
      lines.push(`      # ${displayName} - uses Anthropic-compatible API`);
      if (description) {
        lines.push(`      # ${description}`);
      }
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      if (apiUrl) {
        lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      }
      lines.push(`      # API Provider: ${displayName}`);
    }
  }

  return lines;
}

/**
 * Build header comment section
 * @param _config The configuration object (unused but kept for consistency)
 * @param language The language code (e.g., 'zh-CN', 'en-US')
 * @param now The current date/time (for testability)
 * @returns Array of header comment lines
 */
export function buildHeader(
  _config: DockerComposeConfig,
  language: string,
  now: Date
): string[] {
  const lines: string[] = [];

  // Support information based on language
  const supportInfo = language === 'zh-CN' ? {
    title: '支持信息',
    description: '如果您遇到任何问题或需要技术支持:',
    qqGroup: '加入我们的 QQ 群',
    qqNumber: '610394020',
    discord: '加入我们的 Discord 社区',
    discordLink: 'https://discord.gg/qY662sJK',
    assistance: '我们提供实时协助和解决方案',
    share: '分享您的经验并与其他用户交流'
  } : {
    title: 'Support Information',
    description: 'If you encounter any issues or need technical support:',
    qqGroup: 'Join our QQ group',
    qqNumber: '610394020',
    discord: 'Join our Discord community',
    discordLink: 'https://discord.gg/qY662sJK',
    assistance: 'We provide real-time assistance and solutions',
    share: 'Share your experiences and connect with other users'
  };

  // Header comment
  lines.push('# Hagicode Docker Compose Configuration');
  lines.push('# Auto-generated by Docker Compose Generator');
  lines.push(`# Generated at: ${now.toLocaleString(language === 'zh-CN' ? 'zh-CN' : 'en-US', { timeZone: 'UTC' })}`);
  lines.push('');
  lines.push('# ==================================================');
  lines.push(`# ${supportInfo.title}`);
  lines.push('# ==================================================');
  lines.push(`# ${supportInfo.description}`);
  lines.push(`# - ${supportInfo.qqGroup}: ${supportInfo.qqNumber}`);
  lines.push(`# - ${supportInfo.discord}: ${supportInfo.discordLink}`);
  lines.push(`# - ${supportInfo.assistance}`);
  lines.push(`# - ${supportInfo.share}`);
  lines.push('');

  return lines;
}

/**
 * Build application service (hagicode) configuration
 * @param config The configuration object
 * @param providerConfig Optional provider configuration
 * @returns Array of app service configuration lines
 */
export function buildAppService(
  config: DockerComposeConfig,
  providerConfig?: ProviderPreset
): string[] {
  const lines: string[] = [];

  lines.push('  hagicode:');
  const imagePrefix = REGISTRIES[config.imageRegistry].imagePrefix;
  let appImage: string;

  if (config.imageRegistry === 'aliyun-acr') {
    appImage = `${imagePrefix}/hagicode:${config.imageTag}`;
  } else {
    appImage = `${imagePrefix}:${config.imageTag}`;
  }

  lines.push(`    image: ${appImage}`);
  lines.push(`    container_name: ${config.containerName}`);
  lines.push('    environment:');
  lines.push(`      ASPNETCORE_ENVIRONMENT: ${config.aspNetEnvironment}`);
  lines.push('      ASPNETCORE_URLS: http://+:45000');
  lines.push(`      TZ: ${config.timezone}`);

  // Database connection string and provider
  if (config.databaseType === 'sqlite') {
    lines.push('      Database__Provider: sqlite');
    lines.push('      ConnectionStrings__Default: "Data Source=/app/data/hagicode.db"');
  } else if (config.databaseType === 'internal') {
    lines.push('      Database__Provider: postgresql');
    lines.push(`      ConnectionStrings__Default: "Host=postgres;Port=5432;Database=${config.postgresDatabase};Username=${config.postgresUser};Password=${config.postgresPassword}"`);
  } else {
    lines.push('      Database__Provider: postgresql');
    lines.push(`      ConnectionStrings__Default: "Host=${config.externalDbHost};Port=${config.externalDbPort};Database=${config.postgresDatabase};Username=${config.postgresUser};Password=${config.postgresPassword}"`);
  }

  lines.push(`      License__Activation__LicenseKey: "${config.licenseKey}"`);

  // User mapping for Linux
  if (config.hostOS === 'linux' && !config.workdirCreatedByRoot && (config.puid || config.pgid)) {
    lines.push(`      PUID: ${config.puid}`);
    lines.push(`      PGID: ${config.pgid}`);
  }

  // Runtime provider configuration (Claude/Codex can both be enabled).
  const providerEnvVars = buildProviderEnvVars(config, providerConfig);
  lines.push(...providerEnvVars);

  // Claude Code Extended Configuration (only when Claude capability is enabled)
  if (isExecutorEnabled(config, 'claude')) {
    if (config.anthropicSonnetModel) {
      lines.push(`      ANTHROPIC_SONNET_MODEL: "${config.anthropicSonnetModel}"`);
    }
    if (config.anthropicOpusModel) {
      lines.push(`      ANTHROPIC_OPUS_MODEL: "${config.anthropicOpusModel}"`);
    }
    if (config.anthropicHaikuModel) {
      lines.push(`      ANTHROPIC_HAIKU_MODEL: "${config.anthropicHaikuModel}"`);
    }
    if (config.claudeCodeExperimentalAgentTeams) {
      lines.push(`      CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS: "${config.claudeCodeExperimentalAgentTeams}"`);
    }
  }

  if (!config.enableHttps) {
    lines.push('    ports:');
    lines.push(`      - "${config.httpPort}:45000"`);
  }
  lines.push('    volumes:');

  // Work directory mapping
  if (config.hostOS === 'windows') {
    lines.push(`      - ${config.workdirPath || 'C:\\\\repos'}:/app/workdir`);
  } else {
    lines.push(`      - ${config.workdirPath || '/home/user/repos'}:/app/workdir`);
  }

  // Application data volume (always present for all database types)
  // Contains SQLite database file when using SQLite, or Orleans grain storage, logs, etc. for PostgreSQL
  lines.push('      - hagicode_data:/app/data');

  // Claude Code configuration volume (persists user config, session history, and plugins)
  lines.push('      - claude-data:/home/hagicode/.claude');

  // Depends on (only for internal PostgreSQL)
  if (config.databaseType === 'internal') {
    lines.push('    depends_on:');
    lines.push('      postgres:');
    lines.push('        condition: service_healthy');
  }

  lines.push('    networks:');
  lines.push('      - pcode-network');
  lines.push('    restart: unless-stopped');

  return lines;
}

/**
 * Build Caddyfile content for LAN HTTPS reverse proxy
 * @param config The configuration object
 * @returns Caddyfile content as string
 */
export function buildCaddyfile(config: DockerComposeConfig): string {
  const host = config.lanIp || '127.0.0.1';
  const httpsPort = config.httpsPort || '443';
  const httpsListener = httpsPort === '443' ? host : `${host}:${httpsPort}`;

  const lines = [
    '# Auto-generated Caddyfile for Hagicode HTTPS',
    '# Copy this content to ./Caddyfile next to docker-compose.yml',
    '',
    `${httpsListener} {`,
    '  tls internal',
    '',
    '  handle /health {',
    '    respond "OK" 200',
    '  }',
    '',
    '  reverse_proxy hagicode:45000 {',
    '    header_up Host {host}',
    '    header_up X-Forwarded-For {remote_host}',
    '    header_up X-Forwarded-Proto {scheme}',
    '  }',
    '}',
    ''
  ];

  if (httpsPort === '443') {
    lines.push('http://{host} {');
    lines.push('  redir https://{host}{uri} permanent');
    lines.push('}');
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Build Caddy reverse proxy service configuration
 * @param config The configuration object
 * @returns Array of Caddy service configuration lines
 */
export function buildCaddyService(config: DockerComposeConfig): string[] {
  const lines: string[] = [];

  lines.push('');
  lines.push('  https-proxy:');
  lines.push('    image: caddy:2-alpine');
  lines.push('    container_name: https-proxy');
  lines.push('    ports:');
  lines.push(`      - "${config.httpsPort}:443"`);
  if ((config.httpsPort || '443') === '443') {
    lines.push('      - "80:80"');
  }
  lines.push('    volumes:');
  lines.push('      - ./Caddyfile:/etc/caddy/Caddyfile:ro');
  lines.push('      - caddy_data:/data');
  lines.push('      - caddy_config:/config');
  lines.push('    depends_on:');
  lines.push('      - hagicode');
  lines.push('    healthcheck:');
  lines.push('      test: ["CMD-SHELL", "wget --spider --no-check-certificate https://localhost:443/health || exit 1"]');
  lines.push('      interval: 30s');
  lines.push('      timeout: 10s');
  lines.push('      retries: 3');
  lines.push('    logging:');
  lines.push('      options:');
  lines.push('        max-size: "10m"');
  lines.push('        max-file: "3"');
  lines.push('    networks:');
  lines.push('      - pcode-network');
  lines.push('    restart: unless-stopped');

  return lines;
}

/**
 * Build PostgreSQL service configuration
 * @param config The configuration object
 * @returns Array of PostgreSQL service configuration lines
 */
export function buildPostgresService(config: DockerComposeConfig): string[] {
  const lines: string[] = [];

  const imagePrefix = REGISTRIES[config.imageRegistry].imagePrefix;
  let dbImage: string;

  if (config.imageRegistry === 'aliyun-acr') {
    dbImage = `${imagePrefix}/bitnami_postgresql:16`;
  } else {
    dbImage = 'bitnami/postgresql:latest';
  }

  lines.push('');
  lines.push('  postgres:');
  lines.push(`    image: ${dbImage}`);
  lines.push('    environment:');
  lines.push(`      POSTGRES_DATABASE: ${config.postgresDatabase}`);
  lines.push(`      POSTGRES_USER: ${config.postgresUser}`);
  lines.push(`      POSTGRES_PASSWORD: ${config.postgresPassword}`);
  lines.push('      POSTGRES_HOST_AUTH_METHOD: trust');
  lines.push(`      TZ: ${config.timezone}`);
  lines.push('    volumes:');

  if (config.volumeType === 'named') {
    const volName = config.volumeName || 'postgres-data';
    lines.push(`      - ${volName}:/bitnami/postgresql`);
  } else {
    const defaultPath = config.hostOS === 'windows' ? 'C:\\\\data\\\\postgres' : '/data/postgres';
    lines.push(`      - ${config.volumePath || defaultPath}:/bitnami/postgresql`);
  }

  lines.push('    healthcheck:');
  lines.push(`      test: ["CMD", "pg_isready", "-U", "${config.postgresUser}"]`);
  lines.push('      interval: 10s');
  lines.push('      timeout: 3s');
  lines.push('      retries: 3');
  lines.push('    networks:');
  lines.push('      - pcode-network');
  lines.push('    restart: unless-stopped');

  return lines;
}

/**
 * Build services section
 * @param config The configuration object
 * @param providerConfig Optional provider configuration
 * @returns Array of services section lines
 */
export function buildServicesSection(
  config: DockerComposeConfig,
  providerConfig?: ProviderPreset
): string[] {
  const lines: string[] = [];

  lines.push('services:');

  // Add app service
  const appServiceLines = buildAppService(config, providerConfig);
  lines.push(...appServiceLines);

  if (config.enableHttps) {
    const caddyServiceLines = buildCaddyService(config);
    lines.push(...caddyServiceLines);
  }

  if (isExecutorEnabled(config, 'copilot-cli')) {
    const copilotServiceLines = buildCopilotCliService(config);
    lines.push(...copilotServiceLines);
  }

  // Add internal PostgreSQL service if needed
  if (config.databaseType === 'internal') {
    const postgresServiceLines = buildPostgresService(config);
    lines.push(...postgresServiceLines);
  }

  return lines;
}

export function buildCopilotCliService(config: DockerComposeConfig): string[] {
  const lines: string[] = [];
  const imagePrefix = REGISTRIES[config.imageRegistry].imagePrefix;
  const imageTag = config.imageTag;
  const image = config.imageRegistry === 'aliyun-acr'
    ? `${imagePrefix}/hagicode:${imageTag}`
    : `${imagePrefix}:${imageTag}`;

  lines.push('');
  lines.push('  copilot-cli:');
  lines.push(`    image: ${image}`);
  lines.push(`    container_name: ${config.containerName}-copilot`);
  lines.push('    environment:');
  lines.push(`      COPILOT_API_KEY: "${config.copilotApiKey}"`);
  if (config.copilotBaseUrl && config.copilotBaseUrl.trim()) {
    lines.push(`      COPILOT_BASE_URL: "${config.copilotBaseUrl}"`);
  }
  lines.push('    working_dir: /workspace');

  if (config.copilotMountWorkspace) {
    lines.push('    volumes:');
    if (config.hostOS === 'windows') {
      lines.push(`      - ${config.workdirPath || 'C:\\\\repos'}:/workspace`);
    } else {
      lines.push(`      - ${config.workdirPath || '/home/user/repos'}:/workspace`);
    }
  }

  lines.push('    command: ["sleep", "infinity"]');
  lines.push('    networks:');
  lines.push('      - pcode-network');
  lines.push('    restart: unless-stopped');

  return lines;
}

/**
 * Build volumes section
 * @param config The configuration object
 * @returns Array of volumes section lines
 */
export function buildVolumesSection(config: DockerComposeConfig): string[] {
  const lines: string[] = [];

  lines.push('');
  lines.push('volumes:');

  // hagicode_data is always present (contains app data: SQLite database or Orleans grain storage, logs, etc.)
  lines.push('  hagicode_data:');

  // claude-data is always present (persists Claude Code configuration, session history, and plugins)
  lines.push('  claude-data:');

  if (config.enableHttps) {
    lines.push('  caddy_data:');
    lines.push('  caddy_config:');
  }

  // postgres-data volume only for internal PostgreSQL
  if (config.databaseType === 'internal' && config.volumeType === 'named') {
    const volName = config.volumeName || 'postgres-data';
    lines.push(`  ${volName}:`);
  }

  return lines;
}

/**
 * Build networks section
 * @returns Array of networks section lines
 */
export function buildNetworksSection(): string[] {
  const lines: string[] = [];

  lines.push('');
  lines.push('networks:');
  lines.push('  pcode-network:');
  lines.push('    driver: bridge');

  return lines;
}

/**
 * Generate Docker Compose YAML configuration
 * @param config The configuration object
 * @param providerConfig Optional provider configuration
 * @param language The language code (e.g., 'zh-CN', 'en-US')
 * @param now The current date/time (for testability, defaults to current time)
 * @returns Generated YAML string
 */
export function generateYAML(
  config: DockerComposeConfig,
  providerConfig?: ProviderPreset,
  language: string = 'zh-CN',
  now: Date = new Date()
): string {
  const lines: string[] = [];

  // Build header
  const headerLines = buildHeader(config, language, now);
  lines.push(...headerLines);

  // Build services section
  const servicesLines = buildServicesSection(config, providerConfig);
  lines.push(...servicesLines);

  // Build volumes section
  const volumesLines = buildVolumesSection(config);
  lines.push(...volumesLines);

  // Build networks section
  const networksLines = buildNetworksSection();
  lines.push(...networksLines);

  return lines.join('\n');
}
