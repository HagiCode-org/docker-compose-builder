import { describe, expect, it } from 'vitest';

import {
  buildAppService,
  buildCaddyService,
  buildCaddyfile,
  buildHeader,
  buildNetworksSection,
  buildPostgresService,
  buildServicesSection,
  buildVolumesSection,
  generateYAML,
} from '../../generator';
import {
  FIXED_DATE,
  createMockConfig,
  createOpenCodeConfig,
} from '../helpers/config';
import { getServiceVolumes, hasService, hasVolume } from '../helpers/yaml';

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

  it('renders the managed OpenCode runtime contract explicitly', () => {
    const appService = buildAppService(createOpenCodeConfig()).join('\n');

    expect(appService).toContain('AI__Providers__Providers__OpenCodeCli__Enabled: "true"');
    expect(appService).toContain('AI__OpenCode__Enabled: "true"');
    expect(appService).toContain('AI__OpenCode__ExecutablePath: "opencode"');
    expect(appService).toContain('AI__OpenCode__Model: "anthropic/claude-sonnet-4"');
    expect(appService).toContain('opencode-config-data:/home/hagicode/.config/opencode');
  });

  it('renders a bind mount when OpenCode host-file mode is selected', () => {
    const appService = buildAppService(createOpenCodeConfig({
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: '/srv/opencode/opencode.json',
    })).join('\n');

    expect(appService).toContain('/srv/opencode/opencode.json:/home/hagicode/.config/opencode/opencode.json');
    expect(appService).not.toContain('opencode-config-data:/home/hagicode/.config/opencode');
  });

  it('mounts only retained executor state volumes when enabled', () => {
    const appService = buildAppService(createMockConfig({
      enabledExecutors: ['codex', 'opencode'],
      anthropicAuthToken: '',
      codexApiKey: 'test-codex-key',
      openCodeConfigMode: 'default-managed',
    })).join('\n');

    expect(appService).toContain('codex-data:/home/hagicode/.codex');
    expect(appService).toContain('opencode-config-data:/home/hagicode/.config/opencode');
    expect(appService).not.toContain('claude-data:/home/hagicode/.claude');
    expect(appService).not.toContain('copilot-data:/home/hagicode/.copilot');
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
  it('includes conditional postgres services only when required', () => {
    const withPostgres = buildServicesSection(createMockConfig({
      enabledExecutors: ['claude', 'codex'],
      databaseType: 'internal',
      codexApiKey: 'test-codex-key',
    })).join('\n');
    const withoutPostgres = buildServicesSection(createMockConfig({
      enabledExecutors: ['opencode'],
      anthropicAuthToken: '',
    })).join('\n');

    expect(withPostgres).toContain('postgres:');
    expect(withoutPostgres).not.toContain('postgres:');
    expect(withoutPostgres).not.toContain('copilot-cli:');
  });

  it('builds volumes and networks sections', () => {
    const volumes = buildVolumesSection(createMockConfig({
      databaseType: 'internal',
      volumeType: 'named',
    })).join('\n');
    const networks = buildNetworksSection().join('\n');

    expect(volumes).toContain('hagicode_data:');
    expect(volumes).toContain('claude-data:');
    expect(volumes).toContain('postgres-data:');
    expect(networks).toContain('pcode-network:');
    expect(networks).toContain('driver: bridge');
  });

  it('adds the OpenCode named volume only for the default-managed mode', () => {
    const managedVolumes = buildVolumesSection(createOpenCodeConfig()).join('\n');
    const hostFileVolumes = buildVolumesSection(createOpenCodeConfig({
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: '/srv/opencode/opencode.json',
    })).join('\n');

    expect(managedVolumes).toContain('opencode-config-data:');
    expect(hostFileVolumes).not.toContain('opencode-config-data:');
  });

  it('declares only the managed executor volumes that are actually used', () => {
    const yaml = generateYAML(createMockConfig({
      enabledExecutors: ['codex', 'opencode'],
      anthropicAuthToken: '',
      codexApiKey: 'test-codex-key',
      openCodeConfigMode: 'default-managed',
    }), undefined, 'en-US', FIXED_DATE);

    expect(hasVolume(yaml, 'codex-data')).toBe(true);
    expect(hasVolume(yaml, 'opencode-config-data')).toBe(true);
    expect(hasVolume(yaml, 'claude-data')).toBe(false);
    expect(hasVolume(yaml, 'kimi-data')).toBe(false);
    expect(hasVolume(yaml, 'copilot-data')).toBe(false);
  });
});

describe('generateYAML', () => {
  it('generates a complete compose file for the retained executor matrix', () => {
    const yaml = generateYAML(createMockConfig({
      enabledExecutors: ['claude', 'codex', 'opencode'],
      anthropicAuthToken: 'test-token',
      codexApiKey: 'test-codex-key',
      openCodeModel: 'openai/gpt-5',
      databaseType: 'internal',
      volumeType: 'named',
      volumeName: 'postgres-data',
    }), undefined, 'zh-CN', FIXED_DATE);

    expect(yaml).toContain('# Hagicode Docker Compose Configuration');
    expect(yaml).toContain('services:');
    expect(yaml).toContain('postgres:');
    expect(yaml).toContain('CODEX_API_KEY: "test-codex-key"');
    expect(yaml).toContain('AI__Providers__Providers__OpenCodeCli__Enabled: "true"');
    expect(yaml).toContain('opencode-config-data:/home/hagicode/.config/opencode');
    expect(yaml).not.toContain('AI__Providers__DefaultProvider');
    expect(yaml).not.toContain('copilot-cli:');
    expect(yaml).not.toContain('CODEBUDDY_API_KEY');
    expect(yaml).not.toContain('QODER_PERSONAL_ACCESS_TOKEN');
  });

  it('keeps the standard hagicode image tag fixed at 0 across supported registries', () => {
    const expectedImages = {
      'docker-hub': 'newbe36524/hagicode:0',
      'azure-acr': 'hagicode.azurecr.io/hagicode:0',
      'aliyun-acr': 'registry.cn-hangzhou.aliyuncs.com/hagicode/hagicode:0',
    } as const;

    (Object.keys(expectedImages) as Array<keyof typeof expectedImages>).forEach((imageRegistry) => {
      const yaml = generateYAML(createMockConfig({
        imageRegistry,
        imageTag: '0',
      }), undefined, 'en-US', FIXED_DATE);

      expect(yaml).toContain(`image: ${expectedImages[imageRegistry]}`);
    });
  });

  it('does not emit removed executor services or volumes', () => {
    const yaml = generateYAML(createMockConfig({
      enabledExecutors: ['codex', 'opencode'],
      anthropicAuthToken: '',
      codexApiKey: 'test-codex-key',
      openCodeConfigMode: 'default-managed',
    }), undefined, 'en-US', FIXED_DATE);

    expect(hasService(yaml, 'copilot-cli')).toBe(false);
    expect(getServiceVolumes(yaml, 'hagicode')).not.toContain('copilot-data:/home/hagicode/.copilot');
    expect(yaml).not.toContain('CODEBUDDY_API_KEY');
    expect(yaml).not.toContain('QODER_PERSONAL_ACCESS_TOKEN');
  });
});
