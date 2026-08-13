import type { DockerComposeConfig } from './types';
import {
  localizeProviderPreset,
  type ProviderPreset,
} from './providerConfigLoader';
import {
  OPENCODE_AUTH_TARGET_FILE,
  OPENCODE_AUTH_TARGET_DIR,
  REGISTRIES,
  ZAI_API_URL,
  ALIYUN_API_URL,
  VOLCENGINE_API_URL,
  OPENCODE_CONFIG_TARGET_DIR,
  OPENCODE_CONFIG_TARGET_FILE,
  OPENCODE_MODELS_TARGET_DIR,
  OPENCODE_MODELS_TARGET_FILE,
} from './types';
import { resolveBuilderLanguageCode } from '@/i18n/config';
import { getBuilderMessage } from '@/i18n/resources';

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
function translateGenerator(language: string, key: string, interpolation?: Record<string, string | number>, fallback = key): string {
  return getBuilderMessage(resolveBuilderLanguageCode(language), key, interpolation, fallback);
}

function getLocalizedProviderFallback(
  language: string,
  providerId: string,
  field: 'name' | 'description',
  fallback: string,
): string {
  return getBuilderMessage(language, `providers:providers.${providerId}.${field}`, undefined, fallback);
}

function getProviderDisplayName(
  providerId: string,
  providerConfig: ProviderPreset | undefined,
  language: string,
): string {
  const localizedProvider = providerConfig ? localizeProviderPreset(providerConfig, language) : undefined;

  // Legacy fallback for backward compatibility with existing tests
  switch (providerId) {
    case 'anthropic':
      return getLocalizedProviderFallback(language, providerId, 'name', localizedProvider?.name ?? 'Anthropic Official');
    case 'zai':
      return getLocalizedProviderFallback(language, providerId, 'name', localizedProvider?.name ?? 'Zhipu AI (ZAI)');
    case 'aliyun':
      return getLocalizedProviderFallback(language, providerId, 'name', localizedProvider?.name ?? 'Aliyun DashScope');
    case 'custom':
      return getLocalizedProviderFallback(language, providerId, 'name', localizedProvider?.name ?? 'Custom Endpoint');
    case 'minimax':
      return getLocalizedProviderFallback(language, providerId, 'name', localizedProvider?.name ?? 'MiniMax');
    case 'volcengine':
      return getLocalizedProviderFallback(language, providerId, 'name', localizedProvider?.name ?? 'Volcengine Coding Plan');
    default:
      return localizedProvider?.name || providerId;
  }
}

/**
 * Get provider description for comments in Docker Compose
 * @param providerId The provider ID
 * @param providerConfig Optional provider configuration
 * @returns The provider description
 */
function getProviderDescription(
  providerId: string,
  providerConfig: ProviderPreset | undefined,
  language: string,
): string | null {
  if (providerConfig) {
    return localizeProviderPreset(providerConfig, language).description;
  }

  const fallbackDescription = getBuilderMessage(language, `providers:providers.${providerId}.description`, undefined, '');
  if (fallbackDescription) {
    return fallbackDescription;
  }

  return null;
}

function isExecutorEnabled(config: DockerComposeConfig, executor: DockerComposeConfig['enabledExecutors'][number]): boolean {
  return Array.isArray(config.enabledExecutors) && config.enabledExecutors.includes(executor);
}

function hasTextValue(value: string | undefined): value is string {
  return Boolean(value?.trim());
}

function getCodeServerCommentCopy(language: string) {
  return {
    title: translateGenerator(language, 'docker-compose:generator.codeServer.title'),
    privateHint: translateGenerator(language, 'docker-compose:generator.codeServer.privateHint'),
    persistenceHint: translateGenerator(language, 'docker-compose:generator.codeServer.persistenceHint'),
    disabledHint: translateGenerator(language, 'docker-compose:generator.codeServer.disabledHint'),
    publishHint: translateGenerator(language, 'docker-compose:generator.codeServer.publishHint'),
    systemVolumeHint: translateGenerator(language, 'docker-compose:generator.codeServer.systemVolumeHint'),
    saveVolumeHint: translateGenerator(language, 'docker-compose:generator.codeServer.saveVolumeHint'),
  };
}

function buildCodeServerEnvVars(config: DockerComposeConfig, language: string): string[] {
  if (config.profile !== 'full-custom') {
    return [];
  }

  const copy = getCodeServerCommentCopy(language);
  const lines: string[] = [
    '      # ==================================================',
    `      # ${copy.title}`,
    '      # ==================================================',
    `      # ${copy.privateHint}`,
    `      # ${copy.persistenceHint}`,
  ];

  if (!config.enableCodeServer) {
    lines.push(`      # ${copy.disabledHint}`);
    lines.push('      VsCodeServer__DefaultActiveImplementation: "code-serve-web"');
    return lines;
  }

  lines.push('      VsCodeServer__DefaultActiveImplementation: "code-server"');
  lines.push(`      VsCodeServer__CodeServerDefaultHost: "${config.codeServerHost}"`);
  lines.push(`      VsCodeServer__CodeServerDefaultPort: ${config.codeServerPort}`);
  lines.push('      VsCodeServer__CodeServerExecutablePath: "code-server"');
  lines.push(`      VsCodeServer__CodeServerAuthMode: "${config.codeServerAuthMode}"`);

  if (config.codeServerAuthMode === 'password' && hasTextValue(config.codeServerPassword)) {
    lines.push(`      CODE_SERVER_PASSWORD: "${config.codeServerPassword}"`);
  }

  return lines;
}

type OpenCodeHostFileMount = {
  hostPath: string | undefined;
  targetPath: string;
};

type ExecutorVolumeSpec = {
  executor: DockerComposeConfig['enabledExecutors'][number];
  volumeName: string;
  targetPath: string;
  hostPath?: (config: DockerComposeConfig) => string | undefined;
};

const APP_EXECUTOR_VOLUME_SPECS: ExecutorVolumeSpec[] = [
  { executor: 'claude', volumeName: 'claude-data', targetPath: '/home/hagicode/.claude' },
  { executor: 'codex', volumeName: 'codex-data', targetPath: '/home/hagicode/.codex' },
];

const EXECUTOR_VOLUME_DECLARATION_ORDER = [
  'claude-data',
  'codex-data',
  'opencode-config-data',
  'opencode-auth-data',
  'opencode-models-data',
] as const;

function getExecutorVolumeSource(
  config: DockerComposeConfig,
  spec: ExecutorVolumeSpec
): string | null {
  if (!isExecutorEnabled(config, spec.executor)) {
    return null;
  }

  const hostPath = spec.hostPath?.(config);
  if (hasTextValue(hostPath)) {
    return hostPath;
  }

  return spec.volumeName;
}

function getAppExecutorVolumeMounts(config: DockerComposeConfig): string[] {
  const mounts: string[] = [];

  for (const spec of APP_EXECUTOR_VOLUME_SPECS) {
    const source = getExecutorVolumeSource(config, spec);
    if (source) {
      mounts.push(`      - ${source}:${spec.targetPath}`);
    }
  }

  if (isExecutorEnabled(config, 'opencode')) {
    if (config.openCodeConfigMode === 'host-file' && hasTextValue(config.openCodeConfigHostPath)) {
      mounts.push(`      - ${config.openCodeConfigHostPath}:${OPENCODE_CONFIG_TARGET_FILE}`);

      const additionalOpenCodeFiles: OpenCodeHostFileMount[] = [
        {
          hostPath: config.openCodeAuthHostPath,
          targetPath: OPENCODE_AUTH_TARGET_FILE,
        },
        {
          hostPath: config.openCodeModelsHostPath,
          targetPath: OPENCODE_MODELS_TARGET_FILE,
        },
      ];

      for (const file of additionalOpenCodeFiles) {
        if (hasTextValue(file.hostPath)) {
          mounts.push(`      - ${file.hostPath}:${file.targetPath}`);
        }
      }
    } else {
      mounts.push(`      - opencode-config-data:${OPENCODE_CONFIG_TARGET_DIR}`);
      mounts.push(`      - opencode-auth-data:${OPENCODE_AUTH_TARGET_DIR}`);
      mounts.push(`      - opencode-models-data:${OPENCODE_MODELS_TARGET_DIR}`);
    }
  }

  return mounts;
}

function getUsedExecutorNamedVolumes(config: DockerComposeConfig): Set<string> {
  const usedVolumes = new Set<string>();

  for (const spec of APP_EXECUTOR_VOLUME_SPECS) {
    const source = getExecutorVolumeSource(config, spec);
    if (source === spec.volumeName) {
      usedVolumes.add(spec.volumeName);
    }
  }

  if (isExecutorEnabled(config, 'opencode')) {
    const usesManagedOpenCodeVolume =
      config.openCodeConfigMode !== 'host-file' || !hasTextValue(config.openCodeConfigHostPath);

    if (usesManagedOpenCodeVolume) {
      usedVolumes.add('opencode-config-data');
      usedVolumes.add('opencode-auth-data');
      usedVolumes.add('opencode-models-data');
    }
  }

  return usedVolumes;
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
  providerConfig: ProviderPreset | undefined,
  language: string,
): string[] {
  const lines: string[] = [];

  if (isExecutorEnabled(config, 'codex')) {
    lines.push('      # ==================================================');
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.codex.title')}`);
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.codex.usesEnv')}`);
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.codex.alias')}`);
    lines.push('      # ==================================================');

    if (config.codexApiKey) {
      lines.push(`      CODEX_API_KEY: "${config.codexApiKey}"`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.codex.alias')}: OPENAI_API_KEY = CODEX_API_KEY`);
    }

    if (config.codexBaseUrl && config.codexBaseUrl.trim()) {
      lines.push(`      CODEX_BASE_URL: "${config.codexBaseUrl}"`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.codex.alias')}: OPENAI_BASE_URL = CODEX_BASE_URL`);
    } else {
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.codex.baseUrlOptional')}`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.codex.alias')}: OPENAI_BASE_URL = CODEX_BASE_URL`);
    }
  }

  if (isExecutorEnabled(config, 'opencode')) {
    lines.push('      # ==================================================');
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.opencode.title')}`);
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.opencode.managedContract')}`);
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
    if (!config.anthropicAuthToken) {
      return lines;
    }

    const providerId = config.anthropicApiProvider;
    const apiUrl = getProviderApiUrl(providerId, providerConfig, config.anthropicUrl);

    lines.push('      # ==================================================');
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.claude.title')}`);
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.claude.usesToken')}`);
    lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.runtime.claude.urlHint')}`);
    lines.push('      # ==================================================');

    if (providerId === 'anthropic') {
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.anthropic.heading')}`);
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.anthropic.noUrlHint')}`);
    } else if (providerId === 'zai') {
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.zai.heading')}`);
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.zai.providerLabel')}`);
    } else if (providerId === 'aliyun') {
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.aliyun.heading')}`);
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.aliyun.providerLabel')}`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.aliyun.modelMapping')}`);
      lines.push(`      #   ${translateGenerator(language, 'docker-compose:generator.providers.aliyun.unifiedModelHaiku')}`);
      lines.push(`      #   ${translateGenerator(language, 'docker-compose:generator.providers.aliyun.unifiedModelSonnet')}`);
      lines.push(`      #   ${translateGenerator(language, 'docker-compose:generator.providers.aliyun.unifiedModelOpus')}`);
    } else if (providerId === 'volcengine') {
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.volcengine.heading')}`);
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.volcengine.providerLabel')}`);
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.volcengine.modelMapping')}`);
      lines.push(`      #   ${translateGenerator(language, 'docker-compose:generator.providers.volcengine.unifiedModelHaiku')}`);
      lines.push(`      #   ${translateGenerator(language, 'docker-compose:generator.providers.volcengine.unifiedModelSonnet')}`);
      lines.push(`      #   ${translateGenerator(language, 'docker-compose:generator.providers.volcengine.unifiedModelOpus')}`);
    } else if (providerId === 'custom') {
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.custom.heading')}`);
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      if (apiUrl) {
        lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      }
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.custom.providerLabel')}`);
    } else {
      const displayName = getProviderDisplayName(providerId, providerConfig, language);
      const description = getProviderDescription(providerId, providerConfig, language);
      lines.push(`      # ${displayName} - ${translateGenerator(language, 'docker-compose:generator.providers.generic.compatibleLabel')}`);
      if (description) {
        lines.push(`      # ${description}`);
      }
      lines.push(`      ANTHROPIC_AUTH_TOKEN: "${config.anthropicAuthToken}"`);
      if (apiUrl) {
        lines.push(`      ANTHROPIC_URL: "${apiUrl}"`);
      }
      lines.push(`      # ${translateGenerator(language, 'docker-compose:generator.providers.generic.providerLabel', { displayName })}`);
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
  const normalizedLanguage = resolveBuilderLanguageCode(language);

  lines.push(`# ${translateGenerator(language, 'docker-compose:generator.title')}`);
  lines.push(`# ${translateGenerator(language, 'docker-compose:generator.generatedBy')}`);
  lines.push(`# ${translateGenerator(language, 'docker-compose:generator.generatedAtLabel')}: ${now.toLocaleString(normalizedLanguage, { timeZone: 'UTC' })}`);
  lines.push('');
  lines.push('# ==================================================');
  lines.push(`# ${translateGenerator(language, 'docker-compose:generator.support.title')}`);
  lines.push('# ==================================================');
  lines.push(`# ${translateGenerator(language, 'docker-compose:generator.support.description')}`);
  lines.push(`# - ${translateGenerator(language, 'docker-compose:generator.support.qqGroup')}: ${translateGenerator(language, 'docker-compose:generator.support.qqNumber')}`);
  lines.push(`# - ${translateGenerator(language, 'docker-compose:generator.support.discord')}: ${translateGenerator(language, 'docker-compose:generator.support.discordLink')}`);
  lines.push(`# - ${translateGenerator(language, 'docker-compose:generator.support.assistance')}`);
  lines.push(`# - ${translateGenerator(language, 'docker-compose:generator.support.share')}`);
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
  providerConfig?: ProviderPreset,
  language: string = 'zh-CN'
): string[] {
  const lines: string[] = [];
  const codeServerCopy = getCodeServerCommentCopy(language);

  lines.push('  hagicode:');
  const imagePrefix = getSupportedRegistryImagePrefix(config, language);
  const appImage = `${imagePrefix}:${config.imageTag}`;

  lines.push(`    image: ${appImage}`);
  lines.push(`    container_name: ${config.containerName}`);
  lines.push('    environment:');
  lines.push(`      ASPNETCORE_ENVIRONMENT: ${config.aspNetEnvironment}`);
  lines.push('      ASPNETCORE_URLS: http://+:45000');
  lines.push(`      TZ: ${config.timezone}`);
  lines.push('      Database__Provider: sqlite');
  lines.push('      ConnectionStrings__Default: "Data Source=/app/data/hagicode.db"');

  lines.push(`      License__Activation__LicenseKey: "${config.licenseKey}"`);
  if (config.acceptEula) {
    lines.push('      ACCEPT_EULA: "Y"');
  }

  // User mapping for Linux
  if (config.hostOS === 'linux' && !config.workdirCreatedByRoot && (config.puid || config.pgid)) {
    lines.push(`      PUID: ${config.puid}`);
    lines.push(`      PGID: ${config.pgid}`);
  }

  // Runtime provider configuration (Claude/Codex can both be enabled).
  const providerEnvVars = buildProviderEnvVars(config, providerConfig, language);
  lines.push(...providerEnvVars);
  lines.push(...buildCodeServerEnvVars(config, language));

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

  const portMappings: string[] = [];
  if (!config.enableHttps) {
    portMappings.push(`      - "${config.httpPort}:45000"`);
  }

  if (config.profile === 'full-custom' && config.enableCodeServer && config.codeServerPublishToHost) {
    portMappings.push(`      # ${codeServerCopy.publishHint}`);
    portMappings.push(`      - "127.0.0.1:${config.codeServerPublishedPort}:${config.codeServerPort}"`);
  }

  if (portMappings.length > 0) {
    lines.push('    ports:');
    lines.push(...portMappings);
  }
  lines.push('    volumes:');

  // Work directory mapping
  if (config.hostOS === 'windows') {
    lines.push(`      - ${config.workdirPath || 'C:\\\\repos'}:/app/workdir`);
  } else {
    lines.push(`      - ${config.workdirPath || '/home/user/repos'}:/app/workdir`);
  }

  // Application persistence roots are always present across database modes.
  lines.push(`      # ${codeServerCopy.systemVolumeHint}`);
  lines.push('      - hagicode_data:/app/data');
  lines.push(`      # ${codeServerCopy.saveVolumeHint}`);
  lines.push('      - hagicode_saves:/app/saves');

  lines.push(...getAppExecutorVolumeMounts(config));

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
export function buildCaddyfile(config: DockerComposeConfig, language: string = 'zh-CN'): string {
  const host = config.lanIp || '127.0.0.1';
  const httpsPort = config.httpsPort || '443';
  const httpsListener = httpsPort === '443' ? host : `${host}:${httpsPort}`;

  const lines = [
    `# ${translateGenerator(language, 'docker-compose:generator.caddyfile.title')}`,
    `# ${translateGenerator(language, 'docker-compose:generator.caddyfile.copyHint')}`,
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
 * Build services section
 * @param config The configuration object
 * @param providerConfig Optional provider configuration
 * @returns Array of services section lines
 */
export function buildServicesSection(
  config: DockerComposeConfig,
  providerConfig?: ProviderPreset,
  language: string = 'zh-CN'
): string[] {
  const lines: string[] = [];

  lines.push('services:');

  // Add app service
  const appServiceLines = buildAppService(config, providerConfig, language);
  lines.push(...appServiceLines);

  if (config.enableHttps) {
    const caddyServiceLines = buildCaddyService(config);
    lines.push(...caddyServiceLines);
  }

  return lines;
}

/**
 * Build volumes section
 * @param config The configuration object
 * @returns Array of volumes section lines
 */
export function buildVolumesSection(config: DockerComposeConfig): string[] {
  const lines: string[] = [];
  const usedExecutorVolumes = getUsedExecutorNamedVolumes(config);

  lines.push('');
  lines.push('volumes:');

  // hagicode_data and hagicode_saves are always present for the application service.
  lines.push('  hagicode_data:');
  lines.push('  hagicode_saves:');

  for (const volumeName of EXECUTOR_VOLUME_DECLARATION_ORDER) {
    if (usedExecutorVolumes.has(volumeName)) {
      lines.push(`  ${volumeName}:`);
    }
  }

  if (config.enableHttps) {
    lines.push('  caddy_data:');
    lines.push('  caddy_config:');
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
  getSupportedRegistryImagePrefix(config, language);

  const lines: string[] = [];

  // Build header
  const headerLines = buildHeader(config, language, now);
  lines.push(...headerLines);

  // Build services section
  const localizedServicesLines = buildServicesSection(config, providerConfig, language);
  lines.push(...localizedServicesLines);

  // Build volumes section
  const volumesLines = buildVolumesSection(config);
  lines.push(...volumesLines);

  // Build networks section
  const networksLines = buildNetworksSection();
  lines.push(...networksLines);

  return lines.join('\n');
}

function getSupportedRegistryImagePrefix(
  config: DockerComposeConfig,
  language: string,
): string {
  if (config.imageRegistry !== 'docker-hub') {
    throw new Error(getBuilderMessage(
      language,
      'docker-compose:validation.messages.imageRegistryLegacyRemoved',
    ));
  }

  return REGISTRIES['docker-hub'].imagePrefix;
}
