import { describe, it, expect } from 'vitest';
import {
  buildHeader,
  buildAppService,
  buildPostgresService,
  buildServicesSection,
  buildVolumesSection,
  buildNetworksSection,
  generateYAML
} from '../../generator';
import { createMockConfig, FIXED_DATE } from '../helpers/config';

describe('buildHeader', () => {
  it('should generate header in Chinese', () => {
    const config = createMockConfig();
    const header = buildHeader(config, 'zh-CN', FIXED_DATE);
    const headerStr = header.join('\n');

    expect(headerStr).toContain('# Hagicode Docker Compose Configuration');
    expect(headerStr).toContain('# 支持信息');
    expect(headerStr).toContain('2024/1/1');
  });

  it('should generate header in English', () => {
    const config = createMockConfig();
    const header = buildHeader(config, 'en-US', FIXED_DATE);
    const headerStr = header.join('\n');

    expect(headerStr).toContain('# Hagicode Docker Compose Configuration');
    expect(headerStr).toContain('# Support Information');
    expect(headerStr).toContain('1/1/2024');
  });

  it('should include support information', () => {
    const config = createMockConfig();
    const header = buildHeader(config, 'zh-CN', FIXED_DATE);

    expect(header).toContain('# - 加入我们的 QQ 群: 610394020');
  });
});

describe('buildAppService', () => {
  it('should generate app service with default registry', () => {
    const config = createMockConfig({ imageRegistry: 'docker-hub' });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appService).toContain('  hagicode:');
    expect(appServiceStr).toContain('image: newbe36524/hagicode:latest');
    expect(appServiceStr).toContain('container_name: hagicode');
  });

  it('should generate app service with Aliyun registry', () => {
    const config = createMockConfig({ imageRegistry: 'aliyun-acr' });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('image: registry.cn-hangzhou.aliyuncs.com/hagicode/hagicode:latest');
  });

  it('should include Anthropic API configuration', () => {
    const config = createMockConfig({ anthropicApiProvider: 'anthropic' });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('ANTHROPIC_AUTH_TOKEN: "test-token"');
    expect(appServiceStr).toContain('# Anthropic Official API');
  });

  it('should include ZAI API configuration', () => {
    const config = createMockConfig({ anthropicApiProvider: 'zai' });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('ANTHROPIC_AUTH_TOKEN: "test-token"');
    expect(appServiceStr).toContain('ANTHROPIC_URL: "https://open.bigmodel.cn/api/anthropic"');
    expect(appServiceStr).toContain('# Zhipu AI (ZAI)');
  });

  it('should include custom API configuration', () => {
    const config = createMockConfig({
      anthropicApiProvider: 'custom',
      anthropicUrl: 'https://custom-api.example.com'
    });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('ANTHROPIC_AUTH_TOKEN: "test-token"');
    expect(appServiceStr).toContain('ANTHROPIC_URL: "https://custom-api.example.com"');
    expect(appServiceStr).toContain('# Custom Anthropic-compatible API');
  });

  it('should include PUID/PGID for Linux non-root users', () => {
    const config = createMockConfig({
      hostOS: 'linux',
      workdirCreatedByRoot: false,
      puid: '1000',
      pgid: '1000'
    });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('PUID: 1000');
    expect(appServiceStr).toContain('PGID: 1000');
  });

  it('should not include PUID/PGID for Linux root users', () => {
    const config = createMockConfig({
      hostOS: 'linux',
      workdirCreatedByRoot: true
    });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).not.toContain('PUID:');
    expect(appServiceStr).not.toContain('PGID:');
  });

  it('should use Windows workdir path', () => {
    const config = createMockConfig({
      hostOS: 'windows',
      workdirPath: 'C:\\\\repos'
    });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('- C:\\\\repos:/app/workdir');
  });

  it('should use Linux workdir path', () => {
    const config = createMockConfig({
      hostOS: 'linux',
      workdirPath: '/home/user/repos'
    });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('- /home/user/repos:/app/workdir');
  });

  it('should include database connection string for internal database', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      postgresDatabase: 'testdb',
      postgresUser: 'testuser',
      postgresPassword: 'testpass'
    });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('ConnectionStrings__Default: "Host=postgres;Port=5432;Database=testdb;Username=testuser;Password=testpass"');
  });

  it('should include database connection string for external database', () => {
    const config = createMockConfig({
      databaseType: 'external',
      externalDbHost: 'external-host',
      externalDbPort: '5433',
      postgresDatabase: 'testdb',
      postgresUser: 'testuser',
      postgresPassword: 'testpass'
    });
    const appService = buildAppService(config);
    const appServiceStr = appService.join('\n');

    expect(appServiceStr).toContain('ConnectionStrings__Default: "Host=external-host;Port=5433;Database=testdb;Username=testuser;Password=testpass"');
  });
});

describe('buildPostgresService', () => {
  it('should generate PostgreSQL service with default registry', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      imageRegistry: 'docker-hub'
    });
    const postgresService = buildPostgresService(config);
    const postgresServiceStr = postgresService.join('\n');

    expect(postgresService).toContain('  postgres:');
    expect(postgresServiceStr).toContain('image: bitnami/postgresql:latest');
  });

  it('should generate PostgreSQL service with Aliyun registry', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      imageRegistry: 'aliyun-acr'
    });
    const postgresService = buildPostgresService(config);
    const postgresServiceStr = postgresService.join('\n');

    expect(postgresServiceStr).toContain('image: registry.cn-hangzhou.aliyuncs.com/hagicode/bitnami_postgresql:16');
  });

  it('should use named volume', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      volumeType: 'named',
      volumeName: 'postgres-data'
    });
    const postgresService = buildPostgresService(config);
    const postgresServiceStr = postgresService.join('\n');

    expect(postgresServiceStr).toContain('- postgres-data:/bitnami/postgresql');
  });

  it('should use bind mount', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      volumeType: 'bind',
      volumePath: '/data/postgres'
    });
    const postgresService = buildPostgresService(config);
    const postgresServiceStr = postgresService.join('\n');

    expect(postgresServiceStr).toContain('- /data/postgres:/bitnami/postgresql');
  });

  it('should use default Linux path for bind mount', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      volumeType: 'bind',
      hostOS: 'linux'
    });
    const postgresService = buildPostgresService(config);
    const postgresServiceStr = postgresService.join('\n');

    expect(postgresServiceStr).toContain('- /data/postgres:/bitnami/postgresql');
  });

  it('should use default Windows path for bind mount', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      volumeType: 'bind',
      hostOS: 'windows'
    });
    const postgresService = buildPostgresService(config);
    const postgresServiceStr = postgresService.join('\n');

    expect(postgresServiceStr).toContain('- C:\\\\data\\\\postgres:/bitnami/postgresql');
  });
});

describe('buildServicesSection', () => {
  it('should generate services with internal database', () => {
    const config = createMockConfig({ databaseType: 'internal' });
    const services = buildServicesSection(config);
    const servicesStr = services.join('\n');

    expect(servicesStr).toContain('services:');
    expect(servicesStr).toContain('hagicode:');
    expect(servicesStr).toContain('postgres:');
  });

  it('should generate services without external database', () => {
    const config = createMockConfig({ databaseType: 'external' });
    const services = buildServicesSection(config);
    const servicesStr = services.join('\n');

    expect(servicesStr).toContain('services:');
    expect(servicesStr).toContain('hagicode:');
    expect(servicesStr).not.toContain('postgres:');
  });
});

describe('buildVolumesSection', () => {
  it('should generate volumes for internal database with named volume', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      volumeType: 'named'
    });
    const volumes = buildVolumesSection(config);
    const volumesStr = volumes.join('\n');

    expect(volumesStr).toContain('volumes:');
    expect(volumesStr).toContain('postgres-data:');
  });

  it('should not generate volumes for external database', () => {
    const config = createMockConfig({ databaseType: 'external' });
    const volumes = buildVolumesSection(config);
    const volumesStr = volumes.join('\n');

    expect(volumesStr).not.toContain('volumes:');
  });

  it('should not generate volumes for bind mount', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      volumeType: 'bind'
    });
    const volumes = buildVolumesSection(config);
    const volumesStr = volumes.join('\n');

    expect(volumesStr).not.toContain('volumes:');
  });
});

describe('buildNetworksSection', () => {
  it('should generate networks section', () => {
    const config = createMockConfig();
    const networks = buildNetworksSection(config);
    const networksStr = networks.join('\n');

    expect(networksStr).toContain('networks:');
    expect(networksStr).toContain('pcode-network:');
    expect(networksStr).toContain('driver: bridge');
  });
});

describe('generateYAML', () => {
  it('should generate complete YAML for quick-start config', () => {
    const config = createMockConfig({
      profile: 'quick-start',
      databaseType: 'internal',
      volumeType: 'named'
    });
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    expect(yaml).toContain('# Hagicode Docker Compose Configuration');
    expect(yaml).toContain('services:');
    expect(yaml).toContain('hagicode:');
    expect(yaml).toContain('postgres:');
    expect(yaml).toContain('volumes:');
    expect(yaml).toContain('networks:');
    expect(yaml).toContain('pcode-network:');
  });

  it('should generate YAML without volumes for external database', () => {
    const config = createMockConfig({
      databaseType: 'external',
      externalDbHost: 'external-host',
      externalDbPort: '5432'
    });
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    expect(yaml).toContain('services:');
    expect(yaml).toContain('hagicode:');
    expect(yaml).not.toContain('postgres:');

    // Check that there's no top-level volumes section (after the services section)
    const servicesEnd = yaml.indexOf('restart: unless-stopped');
    const afterServices = yaml.substring(servicesEnd);
    expect(afterServices).not.toContain('\nvolumes:');
  });

  it('should use fixed date when provided', () => {
    const config = createMockConfig();
    const fixedDate = new Date('2024-01-01T00:00:00Z');
    const yaml = generateYAML(config, 'zh-CN', fixedDate);

    expect(yaml).toContain('2024/1/1');
  });
});
