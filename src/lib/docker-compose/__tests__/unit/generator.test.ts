import { describe, expect, it } from 'vitest';
import {
  buildAppService,
  buildCaddyService,
  buildCaddyfile,
  buildCopilotCliService,
  buildHeader,
  buildNetworksSection,
  buildPostgresService,
  buildServicesSection,
  buildVolumesSection,
  generateYAML,
} from '../../generator';
import {
  FIXED_DATE,
  createCodeBuddyConfig,
  createIFlowConfig,
  createMockConfig,
  createOpenCodeConfig,
} from '../helpers/config';

describe('buildHeader', () => {
  it('generates localized support metadata', () => {
    const zhHeader = buildHeader(createMockConfig(), 'zh-CN', FIXED_DATE).join('\n');
    const enHeader = buildHeader(createMockConfig(), 'en-US', FIXED_DATE).join('\n');

    expect(zhHeader).toContain('# 支持信息');
    expect(zhHeader).toContain('2024/1/1');
    expect(enHeader).toContain('# Support Information');
    expect(enHeader).toContain('1/1/2024');
  });
});

describe('buildAppService', () => {
  it('does not emit the removed default-provider key', () => {
    const appService = buildAppService(createMockConfig()).join('\n');

    expect(appService).not.toContain('AI__Providers__DefaultProvider');
  });

  it('renders Claude and Codex branches together when both executors are enabled', () => {
    const appService = buildAppService(createMockConfig({
      enabledExecutors: ['claude', 'codex'],
      anthropicAuthToken: 'test-token',
      codexApiKey: 'test-codex-key',
    })).join('\n');

    expect(appService).toContain('# Claude Runtime Configuration');
    expect(appService).toContain('ANTHROPIC_AUTH_TOKEN: "test-token"');
    expect(appService).toContain('# Codex Runtime Configuration');
    expect(appService).toContain('CODEX_API_KEY: "test-codex-key"');
  });

  it('renders CodeBuddy provider/bootstrap configuration explicitly', () => {
    const appService = buildAppService(createCodeBuddyConfig()).join('\n');

    expect(appService).toContain('AI__Providers__Providers__CodebuddyCli__Enabled: "true"');
    expect(appService).toContain('AI__PlatformConfigurations__CodebuddyCli__Arguments: "--acp"');
    expect(appService).toContain('CODEBUDDY_API_KEY: "cb-test-key"');
    expect(appService).toContain('CODEBUDDY_INTERNET_ENVIRONMENT: "ioa"');
  });

  it('renders IFlow bootstrap configuration without inventing IFLOW runtime variables', () => {
    const appService = buildAppService(createIFlowConfig()).join('\n');

    expect(appService).toContain('AI__Providers__Providers__IFlowCli__Enabled: "true"');
    expect(appService).toContain('AI__PlatformConfigurations__IFlowCli__Arguments: "--experimental-acp --port {port}"');
    expect(appService).toContain('AI__PlatformConfigurations__IFlowCli__AuthMethod: "iflow"');
    expect(appService).not.toMatch(/^\s*IFLOW_/m);
  });

  it('renders the managed OpenCode runtime contract explicitly', () => {
    const appService = buildAppService(createOpenCodeConfig()).join('\n');

    expect(appService).toContain('AI__Providers__Providers__OpenCodeCli__Enabled: "true"');
    expect(appService).toContain('AI__OpenCode__Enabled: "true"');
    expect(appService).toContain('AI__OpenCode__ExecutablePath: "opencode"');
    expect(appService).toContain('AI__OpenCode__Model: "anthropic/claude-sonnet-4"');
  });

  it('renders Copilot runtime variables without a default-provider route', () => {
    const appService = buildAppService(createMockConfig({
      enabledExecutors: ['copilot-cli'],
      imageTag: '1.2.3-copilot',
      copilotApiKey: 'test-copilot-key',
      copilotBaseUrl: 'https://api.githubcopilot.com',
    })).join('\n');

    expect(appService).toContain('COPILOT_API_KEY: "test-copilot-key"');
    expect(appService).toContain('COPILOT_BASE_URL: "https://api.githubcopilot.com"');
    expect(appService).not.toContain('AI__Providers__DefaultProvider');
  });

  it('keeps Linux user mapping and Claude persistence volume behavior', () => {
    const appService = buildAppService(createMockConfig({
      hostOS: 'linux',
      workdirCreatedByRoot: false,
      puid: '1000',
      pgid: '1000',
    })).join('\n');

    expect(appService).toContain('PUID: 1000');
    expect(appService).toContain('PGID: 1000');
    expect(appService).toContain('claude-data:/home/hagicode/.claude');
  });
});

describe('proxy and service helpers', () => {
  it('builds the HTTPS proxy service and Caddyfile', () => {
    const config = createMockConfig({ enableHttps: true, httpsPort: '443', lanIp: '192.168.1.100' });
    const proxyService = buildCaddyService(config).join('\n');
    const caddyfile = buildCaddyfile(config);

    expect(proxyService).toContain('https-proxy:');
    expect(proxyService).toContain('"443:443"');
    expect(caddyfile).toContain('tls internal');
    expect(caddyfile).toContain('reverse_proxy hagicode:45000');
  });

  it('builds the Copilot sidecar service when enabled', () => {
    const service = buildCopilotCliService(createMockConfig({
      enabledExecutors: ['copilot-cli'],
      imageTag: '1.2.3-copilot',
      copilotApiKey: 'test-copilot-key',
      copilotMountWorkspace: true,
      workdirPath: '/workspace',
    })).join('\n');

    expect(service).toContain('copilot-cli:');
    expect(service).toContain('COPILOT_API_KEY: "test-copilot-key"');
    expect(service).toContain('- /workspace:/workspace');
  });

  it('builds the postgres service for internal database mode', () => {
    const postgresService = buildPostgresService(createMockConfig({
      databaseType: 'internal',
      volumeType: 'named',
      volumeName: 'postgres-data',
    })).join('\n');

    expect(postgresService).toContain('postgres:');
    expect(postgresService).toContain('POSTGRES_DATABASE: hagicode');
    expect(postgresService).toContain('- postgres-data:/bitnami/postgresql');
  });
});

describe('section builders', () => {
  it('includes conditional services for copilot and postgres', () => {
    const services = buildServicesSection(createMockConfig({
      enabledExecutors: ['claude', 'copilot-cli'],
      databaseType: 'internal',
      imageTag: '1.2.3-copilot',
      copilotApiKey: 'test-copilot-key',
    })).join('\n');

    expect(services).toContain('services:');
    expect(services).toContain('hagicode:');
    expect(services).toContain('copilot-cli:');
    expect(services).toContain('postgres:');
  });

  it('builds volumes and networks sections', () => {
    const volumes = buildVolumesSection(createMockConfig({ databaseType: 'internal', volumeType: 'named' })).join('\n');
    const networks = buildNetworksSection().join('\n');

    expect(volumes).toContain('hagicode_data:');
    expect(volumes).toContain('claude-data:');
    expect(volumes).toContain('postgres-data:');
    expect(networks).toContain('pcode-network:');
    expect(networks).toContain('driver: bridge');
  });
});

describe('generateYAML', () => {
  it('generates a complete compose file without the removed default-provider line', () => {
    const yaml = generateYAML(createMockConfig({
      enabledExecutors: ['claude', 'codex', 'codebuddy-cli', 'iflow-cli', 'opencode'],
      anthropicAuthToken: 'test-token',
      codexApiKey: 'test-codex-key',
      codebuddyApiKey: 'cb-test-key',
      codebuddyInternetEnvironment: 'ioa',
      databaseType: 'internal',
      volumeType: 'named',
      volumeName: 'postgres-data',
    }), undefined, 'zh-CN', FIXED_DATE);

    expect(yaml).toContain('# Hagicode Docker Compose Configuration');
    expect(yaml).toContain('services:');
    expect(yaml).toContain('postgres:');
    expect(yaml).toContain('AI__Providers__Providers__CodebuddyCli__Enabled: "true"');
    expect(yaml).toContain('AI__Providers__Providers__IFlowCli__Enabled: "true"');
    expect(yaml).toContain('AI__Providers__Providers__OpenCodeCli__Enabled: "true"');
    expect(yaml).not.toContain('AI__Providers__DefaultProvider');
  });

  it('keeps snapshot coverage for copilot compose variants', () => {
    const withVolume = createMockConfig({
      enabledExecutors: ['copilot-cli'],
      imageTag: '1.2.3-copilot',
      copilotApiKey: 'test-copilot-key',
      copilotMountWorkspace: true,
      workdirPath: '/workspace',
    });
    const withoutVolume = createMockConfig({
      enabledExecutors: ['copilot-cli'],
      imageTag: '1.2.3-copilot',
      copilotApiKey: 'test-copilot-key',
      copilotMountWorkspace: false,
    });

    expect(generateYAML(withVolume, undefined, 'en-US', FIXED_DATE)).toMatchSnapshot();
    expect(generateYAML(withoutVolume, undefined, 'en-US', FIXED_DATE)).toMatchSnapshot();
  });
});
