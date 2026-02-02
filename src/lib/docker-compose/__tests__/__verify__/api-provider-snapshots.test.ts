import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import {
  createZaiProviderConfig,
  createAnthropicProviderConfig,
  createCustomProviderConfig,
  FIXED_DATE
} from '../helpers/config';
import {
  validateDockerComposeStructure,
  hasEnvVar,
  getServiceEnvVar,
  parseDockerComposeYAML
} from '../helpers/yaml';

describe('API Provider Profiles - Complete File Verification with YAML Parsing', () => {
  it('should generate valid YAML structure for Anthropic official API', async () => {
    const config = createAnthropicProviderConfig({
      anthropicAuthToken: 'sk-ant-test-key'
    });
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证 Anthropic API 配置
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(false);

    // 验证特定的 token 值
    const authToken = getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN');
    expect(authToken).toBe('sk-ant-test-key');

    // 验证注释
    expect(yaml).toContain('# Anthropic Official API');

    expect(yaml).toMatchSnapshot('api-provider-anthropic-zh-CN');
  });

  it('should generate valid YAML structure for Zhipu AI (ZAI) provider', async () => {
    const config = createZaiProviderConfig({
      anthropicAuthToken: 'test-zai-key'
    });
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证 ZAI API 配置
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(true);

    // 验证 URL 值
    const apiUrl = getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL');
    expect(apiUrl).toBe('https://open.bigmodel.cn/api/anthropic');

    // 验证注释
    expect(yaml).toContain('# Zhipu AI (ZAI) - uses Anthropic-compatible API');
    expect(yaml).toContain('# API Provider: Zhipu AI (ZAI)');

    expect(yaml).toMatchSnapshot('api-provider-zai-zh-CN');
  });

  it('should generate valid YAML structure for custom API endpoint', async () => {
    const config = createCustomProviderConfig({
      anthropicAuthToken: 'custom-api-key',
      anthropicUrl: 'https://custom-ai-proxy.example.com/v1'
    });
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证自定义 API 配置
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(true);

    // 验证 URL 值
    const apiUrl = getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL');
    expect(apiUrl).toBe('https://custom-ai-proxy.example.com/v1');

    // 验证注释
    expect(yaml).toContain('# Custom Anthropic-compatible API');
    expect(yaml).toContain('# API Provider: Custom Endpoint');

    expect(yaml).toMatchSnapshot('api-provider-custom-zh-CN');
  });

  it('should validate that YAML can be parsed without errors', async () => {
    const config = createAnthropicProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证可以解析且没有错误
    expect(() => parseDockerComposeYAML(yaml)).not.toThrow();

    const parsed = parseDockerComposeYAML(yaml);
    expect(parsed).toBeDefined();
    expect(parsed.services).toBeDefined();
    expect(parsed.networks).toBeDefined();
  });

  it('should validate environment variable types', async () => {
    const config = createAnthropicProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = parseDockerComposeYAML(yaml);
    const env = parsed.services.hagicode.environment;

    // 验证环境变量类型
    expect(typeof env.ASPNETCORE_ENVIRONMENT).toBe('string');
    expect(typeof env.ASPNETCORE_URLS).toBe('string');
    expect(typeof env.TZ).toBe('string');
    expect(typeof env.ANTHROPIC_AUTH_TOKEN).toBe('string');
    expect(typeof env.ConnectionStrings__Default).toBe('string');
    expect(typeof env.License__Activation__LicenseKey).toBe('string');
  });

  it('should validate ports array structure', async () => {
    const config = createAnthropicProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = parseDockerComposeYAML(yaml);
    const ports = parsed.services.hagicode.ports;

    // 验证端口是数组
    expect(Array.isArray(ports)).toBe(true);
    expect(ports.length).toBeGreaterThan(0);

    // 验证端口格式
    ports.forEach((port: string) => {
      expect(typeof port).toBe('string');
      expect(port).toContain(':'); // 应该是 "host:container" 格式
    });
  });

  it('should validate volumes array structure', async () => {
    const config = createAnthropicProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = parseDockerComposeYAML(yaml);
    const volumes = parsed.services.hagicode.volumes;

    // 验证卷是数组
    expect(Array.isArray(volumes)).toBe(true);
    expect(volumes.length).toBeGreaterThan(0);

    // 验证卷映射格式
    volumes.forEach((volume: string) => {
      expect(typeof volume).toBe('string');
      expect(volume).toContain(':'); // 应该是 "host:container" 格式
    });
  });

  it('should validate networks structure', async () => {
    const config = createAnthropicProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = parseDockerComposeYAML(yaml);
    const networks = parsed.networks;

    // 验证 networks 对象
    expect(networks).toBeDefined();
    expect(typeof networks).toBe('object');

    // 验证 pcode-network 存在并有正确的驱动
    expect(networks['pcode-network']).toBeDefined();
    expect(networks['pcode-network'].driver).toBe('bridge');
  });

  it('should validate postgres service healthcheck structure', async () => {
    const config = createZaiProviderConfig();
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    const parsed = parseDockerComposeYAML(yaml);
    const healthcheck = parsed.services.postgres.healthcheck;

    // 验证 healthcheck 结构
    expect(healthcheck).toBeDefined();
    expect(Array.isArray(healthcheck.test)).toBe(true);
    expect(healthcheck.test).toContain('pg_isready');
    expect(healthcheck.interval).toBe('10s');
    expect(healthcheck.timeout).toBe('3s');
    expect(healthcheck.retries).toBe(3);
  });
});
