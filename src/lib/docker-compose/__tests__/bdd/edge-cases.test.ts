import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import { createMockConfig, FIXED_DATE } from '../helpers/config';

describe('Docker Compose Generation: Edge Cases', () => {
  describe('Scenario 1: Empty String Handling', () => {
    it('Given empty workdir path, When generating YAML, Then default path should be used', () => {
      // Given
      const config = createMockConfig({
        workdirPath: '',
        hostOS: 'linux'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- /home/user/repos:/app/workdir');
    });

    it('Given empty volume name with named volume type, When generating YAML, Then default volume name should be used', () => {
      // Given
      const config = createMockConfig({
        databaseType: 'internal',
        volumeType: 'named',
        volumeName: ''
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- postgres-data:/bitnami/postgresql');
      expect(result).toContain('postgres-data:');
    });

    it('Given empty volume path with bind mount type, When generating YAML, Then default path should be used', () => {
      // Given
      const config = createMockConfig({
        databaseType: 'internal',
        volumeType: 'bind',
        volumePath: '',
        hostOS: 'linux'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- /data/postgres:/bitnami/postgresql');
    });
  });

  describe('Scenario 2: Port Number Boundaries', () => {
    it('Given port number at boundary (1), When generating YAML, Then port should be included', () => {
      // Given
      const config = createMockConfig({
        httpPort: '1'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- "1:45000"');
    });

    it('Given port number at boundary (65535), When generating YAML, Then port should be included', () => {
      // Given
      const config = createMockConfig({
        httpPort: '65535'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- "65535:45000"');
    });

    it('Given common HTTP port (80), When generating YAML, Then port should be included', () => {
      // Given
      const config = createMockConfig({
        httpPort: '80'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- "80:45000"');
    });

    it('Given common HTTPS port (443), When generating YAML, Then port should be included', () => {
      // Given
      const config = createMockConfig({
        httpPort: '443'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- "443:45000"');
    });
  });

  describe('Scenario 3: Path Format Validation', () => {
    it('Given Windows path format, When generating YAML, Then backslashes should be preserved', () => {
      // Given
      const config = createMockConfig({
        hostOS: 'windows',
        workdirPath: 'C:\\\\My\\\\Projects',
        databaseType: 'internal',
        volumeType: 'bind',
        volumePath: 'D:\\\\Data\\\\PostgreSQL'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- C:\\\\My\\\\Projects:/app/workdir');
      expect(result).toContain('- D:\\\\Data\\\\PostgreSQL:/bitnami/postgresql');
    });

    it('Given Linux path format, When generating YAML, Then forward slashes should be preserved', () => {
      // Given
      const config = createMockConfig({
        hostOS: 'linux',
        workdirPath: '/var/projects',
        databaseType: 'internal',
        volumeType: 'bind',
        volumePath: '/mnt/data/postgresql'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- /var/projects:/app/workdir');
      expect(result).toContain('- /mnt/data/postgresql:/bitnami/postgresql');
    });

    it('Given path with special characters, When generating YAML, Then path should be preserved', () => {
      // Given
      const config = createMockConfig({
        hostOS: 'linux',
        workdirPath: '/home/user/my-projects_2024'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- /home/user/my-projects_2024:/app/workdir');
    });
  });

  describe('Scenario 4: Special Characters Handling', () => {
    it('Given password with special characters, When generating YAML, Then password should be properly quoted', () => {
      // Given
      const config = createMockConfig({
        postgresPassword: 'P@ssw0rd!#$%',
        databaseType: 'internal'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('POSTGRES_PASSWORD: P@ssw0rd!#$%');
      expect(result).toContain('Password=P@ssw0rd!#$%');
    });

    it('Given API token with special characters, When generating YAML, Then token should be properly quoted', () => {
      // Given
      const config = createMockConfig({
        anthropicAuthToken: 'sk-ant-api123_ABC-DEF.xyz'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('ANTHROPIC_AUTH_TOKEN: "sk-ant-api123_ABC-DEF.xyz"');
    });

    it('Given license key with hyphens, When generating YAML, Then license key should be properly quoted', () => {
      // Given
      const config = createMockConfig({
        licenseKey: 'ABCD-1234-EFGH-5678'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('License__Activation__LicenseKey: "ABCD-1234-EFGH-5678"');
    });
  });

  describe('Scenario 5: Container Name Validation', () => {
    it('Given container name with numbers, When generating YAML, Then container name should be preserved', () => {
      // Given
      const config = createMockConfig({
        containerName: 'hagicode-2024-prod'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('container_name: hagicode-2024-prod');
    });

    it('Given container name with underscores, When generating YAML, Then container name should be preserved', () => {
      // Given
      const config = createMockConfig({
        containerName: 'hagicode_prod_v1'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('container_name: hagicode_prod_v1');
    });
  });

  describe('Scenario 6: Image Registry Variations', () => {
    it('Given Docker Hub registry, When generating YAML, Then Docker Hub image prefix should be used', () => {
      // Given
      const config = createMockConfig({
        imageRegistry: 'docker-hub',
        imageTag: 'v1.2.3'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('image: newbe36524/hagicode:v1.2.3');
      expect(result).toContain('bitnami/postgresql:latest');
    });

    it('Given Aliyun ACR registry, When generating YAML, Then Aliyun image prefix should be used', () => {
      // Given
      const config = createMockConfig({
        imageRegistry: 'aliyun-acr',
        imageTag: 'v2.0.0'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('image: registry.cn-hangzhou.aliyuncs.com/hagicode/hagicode:v2.0.0');
      expect(result).toContain('registry.cn-hangzhou.aliyuncs.com/hagicode/bitnami_postgresql:16');
    });

    it('Given Azure ACR registry, When generating YAML, Then Azure image prefix should be used', () => {
      // Given
      const config = createMockConfig({
        imageRegistry: 'azure-acr',
        imageTag: 'latest'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('image: hagicode.azurecr.io/hagicode:latest');
      expect(result).toContain('bitnami/postgresql:latest');
    });
  });
});
