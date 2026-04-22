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
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(false);
    expect(getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe('sk-ant-test-key');
    expect(yaml).toContain('# Anthropic Official API');
    expect(yaml).toMatchSnapshot('api-provider-anthropic-zh-CN');
  });

  it('should generate valid YAML structure for Zhipu AI (ZAI) provider', async () => {
    const config = createZaiProviderConfig({
      anthropicAuthToken: 'test-zai-key'
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(true);
    expect(getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe('https://open.bigmodel.cn/api/anthropic');
    expect(yaml).toContain('# Zhipu AI (ZAI) - uses Anthropic-compatible API');
    expect(yaml).toMatchSnapshot('api-provider-zai-zh-CN');
  });

  it('should generate valid YAML structure for custom API endpoint', async () => {
    const config = createCustomProviderConfig({
      anthropicAuthToken: 'custom-api-key',
      anthropicUrl: 'https://custom-ai-proxy.example.com/v1'
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_AUTH_TOKEN')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe(true);
    expect(getServiceEnvVar(yaml, 'hagicode', 'ANTHROPIC_URL')).toBe('https://custom-ai-proxy.example.com/v1');
    expect(yaml).toContain('# Custom Anthropic-compatible API');
    expect(yaml).toMatchSnapshot('api-provider-custom-zh-CN');
  });

  it('should validate that YAML can be parsed without errors and remains SQLite-only', async () => {
    const config = createAnthropicProviderConfig();
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(() => parseDockerComposeYAML(yaml)).not.toThrow();

    const parsed = parseDockerComposeYAML(yaml);
    expect(parsed.services).toBeDefined();
    expect(parsed.services.hagicode).toBeDefined();
    expect(parsed.services.postgres).toBeUndefined();
    expect(parsed.networks).toBeDefined();
    expect(parsed.services.hagicode.environment.ConnectionStrings__Default).toBe('Data Source=/app/data/hagicode.db');
  });
});
