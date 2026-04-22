import { describe, expect, it } from 'vitest';

import {
  buildAppService,
  buildCaddyService,
  buildCaddyfile,
  buildHeader,
  buildNetworksSection,
  buildServicesSection,
  buildVolumesSection,
  generateYAML,
} from '../../generator';
import {
  FIXED_DATE,
  createFullCustomConfig,
  createMockConfig,
  createOpenCodeConfig,
} from '../helpers/config';
import { getServicePorts, getServiceVolumes, hasService, hasVolume } from '../helpers/yaml';

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

  it('always emits the SQLite runtime contract', () => {
    const appService = buildAppService(createMockConfig()).join('\n');

    expect(appService).toContain('Database__Provider: sqlite');
    expect(appService).toContain('ConnectionStrings__Default: "Data Source=/app/data/hagicode.db"');
    expect(appService).not.toContain('Database__Provider: postgresql');
    expect(appService).not.toContain('Host=postgres;');
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
    expect(appService).toContain('opencode-auth-data:/home/hagicode/.local/share/opencode');
    expect(appService).toContain('opencode-models-data:/home/hagicode/.cache/opencode');
  });

  it('renders a bind mount when OpenCode host-file mode is selected', () => {
    const appService = buildAppService(createOpenCodeConfig({
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: '/srv/opencode/opencode.json',
    })).join('\n');

    expect(appService).toContain('/srv/opencode/opencode.json:/home/hagicode/.config/opencode/opencode.json');
    expect(appService).not.toContain('opencode-config-data:/home/hagicode/.config/opencode');
  });

  it('keeps Linux user mapping and retained persistence volume behavior', () => {
    const appService = buildAppService(createMockConfig({
      hostOS: 'linux',
      workdirCreatedByRoot: false,
      puid: '1000',
      pgid: '1000',
    })).join('\n');

    expect(appService).toContain('PUID: 1000');
    expect(appService).toContain('PGID: 1000');
    expect(appService).toContain('hagicode_data:/app/data');
    expect(appService).toContain('hagicode_saves:/app/saves');
    expect(appService).toContain('claude-data:/home/hagicode/.claude');
  });

  it('exports Code Server defaults only in full-custom mode', () => {
    const appService = buildAppService(createFullCustomConfig({
      codeServerHost: '0.0.0.0',
      codeServerPort: '36529',
      codeServerAuthMode: 'password',
      codeServerPassword: 'super-secret',
    }), undefined, 'en-US').join('\n');

    expect(appService).toContain('VsCodeServer__DefaultActiveImplementation: "code-server"');
    expect(appService).toContain('VsCodeServer__CodeServerDefaultHost: "0.0.0.0"');
    expect(appService).toContain('VsCodeServer__CodeServerDefaultPort: 36529');
    expect(appService).toContain('VsCodeServer__CodeServerAuthMode: "password"');
    expect(appService).toContain('CODE_SERVER_PASSWORD: "super-secret"');
  });

  it('adds a dedicated loopback port mapping when Code Server publishing is enabled', () => {
    const yaml = generateYAML(createFullCustomConfig({
      codeServerHost: '0.0.0.0',
      codeServerPort: '36529',
      codeServerPublishToHost: true,
      codeServerPublishedPort: '36531',
    }), undefined, 'en-US', FIXED_DATE);

    expect(getServicePorts(yaml, 'hagicode')).toContain('8080:45000');
    expect(getServicePorts(yaml, 'hagicode')).toContain('127.0.0.1:36531:36529');
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
});

describe('section builders', () => {
  it('keeps the services section free of postgres sidecars', () => {
    const services = buildServicesSection(createMockConfig({
      enabledExecutors: ['claude', 'codex'],
      codexApiKey: 'test-codex-key',
    })).join('\n');

    expect(services).toContain('hagicode:');
    expect(services).not.toContain('postgres:');
    expect(services).not.toContain('bitnami/postgresql');
  });

  it('builds volumes and networks sections for retained services only', () => {
    const volumes = buildVolumesSection(createMockConfig()).join('\n');
    const networks = buildNetworksSection().join('\n');

    expect(volumes).toContain('hagicode_data:');
    expect(volumes).toContain('hagicode_saves:');
    expect(volumes).toContain('claude-data:');
    expect(volumes).not.toContain('postgres-data:');
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
    expect(managedVolumes).toContain('opencode-auth-data:');
    expect(managedVolumes).toContain('opencode-models-data:');
    expect(hostFileVolumes).not.toContain('opencode-config-data:');
    expect(hostFileVolumes).not.toContain('opencode-auth-data:');
    expect(hostFileVolumes).not.toContain('opencode-models-data:');
  });
});

describe('generateYAML', () => {
  it('generates a complete compose file for the retained executor matrix', () => {
    const yaml = generateYAML(createMockConfig({
      enabledExecutors: ['claude', 'codex', 'opencode'],
      anthropicAuthToken: 'test-token',
      codexApiKey: 'test-codex-key',
      openCodeModel: 'openai/gpt-5',
    }), undefined, 'zh-CN', FIXED_DATE);

    expect(yaml).toContain('# Hagicode Docker Compose Configuration');
    expect(yaml).toContain('services:');
    expect(yaml).toContain('CODEX_API_KEY: "test-codex-key"');
    expect(yaml).toContain('AI__Providers__Providers__OpenCodeCli__Enabled: "true"');
    expect(yaml).toContain('opencode-config-data:/home/hagicode/.config/opencode');
    expect(yaml).not.toContain('postgres:');
    expect(yaml).not.toContain('postgres-data:');
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

  it('does not emit removed executor services or postgres image previews', () => {
    const yaml = generateYAML(createMockConfig({
      enabledExecutors: ['codex', 'opencode'],
      anthropicAuthToken: '',
      codexApiKey: 'test-codex-key',
      openCodeConfigMode: 'default-managed',
    }), undefined, 'en-US', FIXED_DATE);

    expect(hasService(yaml, 'copilot-cli')).toBe(false);
    expect(getServiceVolumes(yaml, 'hagicode')).not.toContain('copilot-data:/home/hagicode/.copilot');
    expect(yaml).not.toContain('bitnami/postgresql');
    expect(yaml).not.toContain('CODEBUDDY_API_KEY');
    expect(yaml).not.toContain('QODER_PERSONAL_ACCESS_TOKEN');
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
    expect(hasVolume(yaml, 'opencode-auth-data')).toBe(true);
    expect(hasVolume(yaml, 'opencode-models-data')).toBe(true);
    expect(hasVolume(yaml, 'claude-data')).toBe(false);
  });
});
