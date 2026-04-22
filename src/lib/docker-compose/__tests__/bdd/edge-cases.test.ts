import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import { createMockConfig, FIXED_DATE } from '../helpers/config';

describe('Docker Compose Generation: Edge Cases', () => {
  it('Given an empty workdir path, When generating YAML, Then the default Linux path should be used', () => {
    const config = createMockConfig({
      workdirPath: '',
      hostOS: 'linux'
    });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).toContain('- /home/user/repos:/app/workdir');
  });

  it('Given a Windows workdir path, When generating YAML, Then backslashes should be preserved', () => {
    const config = createMockConfig({
      hostOS: 'windows',
      workdirPath: 'C:\\\\My\\\\Projects',
    });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).toContain('- C:\\\\My\\\\Projects:/app/workdir');
  });

  it('Given special characters in API token and license key, When generating YAML, Then values should remain quoted', () => {
    const config = createMockConfig({
      anthropicAuthToken: 'sk-ant-api123_ABC-DEF.xyz',
      licenseKey: 'ABCD-1234-EFGH-5678'
    });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).toContain('ANTHROPIC_AUTH_TOKEN: "sk-ant-api123_ABC-DEF.xyz"');
    expect(result).toContain('License__Activation__LicenseKey: "ABCD-1234-EFGH-5678"');
  });

  it('Given any retained image registry, When generating YAML, Then only the hagicode image should be previewed', () => {
    const configs = [
      createMockConfig({ imageRegistry: 'docker-hub', imageTag: 'v1.2.3' }),
      createMockConfig({ imageRegistry: 'aliyun-acr', imageTag: 'v2.0.0' }),
      createMockConfig({ imageRegistry: 'azure-acr', imageTag: 'latest' }),
    ];

    const results = configs.map((config) => generateYAML(config, undefined, 'zh-CN', FIXED_DATE));

    expect(results[0]).toContain('image: newbe36524/hagicode:v1.2.3');
    expect(results[1]).toContain('image: registry.cn-hangzhou.aliyuncs.com/hagicode/hagicode:v2.0.0');
    expect(results[2]).toContain('image: hagicode.azurecr.io/hagicode:latest');

    for (const result of results) {
      expect(result).not.toContain('bitnami/postgresql');
      expect(result).not.toContain('bitnami_postgresql');
      expect(result).not.toContain('postgres:');
    }
  });
});
