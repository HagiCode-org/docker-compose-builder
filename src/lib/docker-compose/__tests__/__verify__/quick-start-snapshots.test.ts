import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import {
  createQuickStartConfig,
  createZaiProviderConfig,
  createAnthropicProviderConfig,
  createCustomProviderConfig,
  FIXED_DATE
} from '../helpers/config';
import {
  validateDockerComposeStructure,
  hasService,
  hasVolume,
  hasNetwork,
  hasEnvVar,
  getServiceEnvVar,
  getServiceImage,
  getServicePorts
} from '../helpers/yaml';

describe('Quick Start Profiles - Complete File Verification with YAML Parsing', () => {
  it('should generate valid YAML structure for default quick start config (zh-CN)', async () => {
    const config = createQuickStartConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 使用 js-yaml 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);

    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证服务存在
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(true);

    // 验证卷存在（内部数据库使用命名卷）
    expect(hasVolume(yaml, 'postgres-data')).toBe(true);

    // 验证网络存在
    expect(hasNetwork(yaml, 'pcode-network')).toBe(true);

    // 验证环境变量
    expect(hasEnvVar(yaml, 'hagicode', 'ASPNETCORE_ENVIRONMENT')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ConnectionStrings__Default')).toBe(true);

    // 验证镜像
    expect(getServiceImage(yaml, 'hagicode')).toBe('newbe36524/hagicode:latest');
    expect(getServiceImage(yaml, 'postgres')).toContain('postgresql');

    // 验证端口映射
    const ports = getServicePorts(yaml, 'hagicode');
    expect(ports).toContain('8080:45000');

    // 验证特定环境变量值
    expect(getServiceEnvVar(yaml, 'hagicode', 'TZ')).toBe('Asia/Shanghai');
    expect(getServiceEnvVar(yaml, 'hagicode', 'ASPNETCORE_ENVIRONMENT')).toBe('Production');

    // 存储完整文件快照
    expect(yaml).toMatchSnapshot('quick-start-default-zh-CN');
  });

  it('should generate valid YAML structure for default quick start config (en-US)', async () => {
    const config = createQuickStartConfig();
    const yaml = generateYAML(config, 'en-US', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证服务
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(true);

    // 验证网络
    expect(hasNetwork(yaml, 'pcode-network')).toBe(true);

    // 验证注释内容（英文）
    expect(yaml).toContain('# Support Information');

    expect(yaml).toMatchSnapshot('quick-start-default-en-US');
  });

  it('should generate valid YAML structure for ZAI provider (zh-CN)', async () => {
    const config = createZaiProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证 ZAI 特定的环境变量
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(true);

    // 验证 ZAI URL
    expect(getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe('https://open.bigmodel.cn/api/anthropic');

    // 验证注释
    expect(yaml).toContain('# Zhipu AI (ZAI)');

    expect(yaml).toMatchSnapshot('quick-start-zai-zh-CN');
  });

  it('should generate valid YAML structure for Anthropic provider (zh-CN)', async () => {
    const config = createAnthropicProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证 Anthropic 特定的配置
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);

    // 验证没有 ANTHROPIC_URL（Anthropic 官方 API 不需要）
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(false);

    // 验证注释
    expect(yaml).toContain('# Anthropic Official API');

    expect(yaml).toMatchSnapshot('quick-start-anthropic-zh-CN');
  });

  it('should generate valid YAML structure for custom provider (zh-CN)', async () => {
    const config = createCustomProviderConfig({
      anthropicUrl: 'https://custom-api.example.com'
    });
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证自定义 API 特定的配置
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(true);

    // 验证自定义 URL
    expect(getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe('https://custom-api.example.com');

    // 验证注释
    expect(yaml).toContain('# Custom Anthropic-compatible API');

    expect(yaml).toMatchSnapshot('quick-start-custom-zh-CN');
  });

  it('should parse YAML correctly and validate service dependencies', async () => {
    const config = createQuickStartConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = validateDockerComposeStructure(yaml);
    expect(parsed.valid).toBe(true);

    // 验证 hagicode 服务依赖 postgres
    const hagicodeService = parsed.parsed.services.hagicode;
    expect(hagicodeService.depends_on).toBeDefined();
    expect(hagicodeService.depends_on.postgres).toBeDefined();
    expect(hagicodeService.depends_on.postgres.condition).toBe('service_healthy');

    // 验证 postgres 的 healthcheck
    const postgresService = parsed.parsed.services.postgres;
    expect(postgresService.healthcheck).toBeDefined();
    expect(postgresService.healthcheck.test).toContain('pg_isready');
    expect(postgresService.healthcheck.interval).toBe('10s');
    expect(postgresService.healthcheck.timeout).toBe('3s');
    expect(postgresService.healthcheck.retries).toBe(3);
  });

  it('should validate network configuration', async () => {
    const config = createQuickStartConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = validateDockerComposeStructure(yaml);
    expect(parsed.valid).toBe(true);

    // 验证网络配置
    const network = parsed.parsed.networks['pcode-network'];
    expect(network).toBeDefined();
    expect(network.driver).toBe('bridge');

    // 验证服务连接到网络
    expect(parsed.parsed.services.hagicode.networks).toContain('pcode-network');
    expect(parsed.parsed.services.postgres.networks).toContain('pcode-network');
  });

  it('should validate restart policy', async () => {
    const config = createQuickStartConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = validateDockerComposeStructure(yaml);
    expect(parsed.valid).toBe(true);

    // 验证重启策略
    expect(parsed.parsed.services.hagicode.restart).toBe('unless-stopped');
    expect(parsed.parsed.services.postgres.restart).toBe('unless-stopped');
  });
});
