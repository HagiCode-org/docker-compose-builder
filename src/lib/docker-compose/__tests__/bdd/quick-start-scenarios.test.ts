import { describe, it, expect } from 'vitest';

import { getBuilderMessage } from '@/i18n/resources';
import { generateYAML } from '../../generator';
import {
  createQuickStartConfig,
  createZaiProviderConfig,
  createAnthropicProviderConfig,
  createCustomProviderConfig,
  FIXED_DATE
} from '../helpers/config';

describe('Docker Compose Generation: Quick Start Profile', () => {
  describe('Scenario 1: Minimal Configuration Generation', () => {
    it('Given a quick start profile with minimal config, When generating YAML, Then output should contain required sections', () => {
      // Given: quick start profile with minimal config
      const config = createQuickStartConfig();

      // When: generating YAML
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then: output should contain required sections
      expect(result).toContain('services:');
      expect(result).toContain('hagicode:');
      // Quick start now uses SQLite, so no postgres service
      expect(result).not.toContain('postgres:');
      expect(result).toContain('volumes:');
      expect(result).toContain('networks:');
    });

    it('Given a quick start profile with minimal config, When generating YAML, Then output should contain basic environment variables', () => {
      // Given
      const config = createQuickStartConfig();

      // When
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('ASPNETCORE_ENVIRONMENT: Production');
      expect(result).toContain('TZ: Asia/Shanghai');
      expect(result).toContain('ASPNETCORE_URLS: http://+:45000');
    });
  });

  describe('Scenario 2: Default Values Handling', () => {
    it('Given a quick start profile, When generating YAML, Then default paths should be used', () => {
      // Given
      const config = createQuickStartConfig({
        workdirPath: ''
      });

      // When
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then: default Linux path should be used
      expect(result).toContain('- /home/user/repos:/app/workdir');
    });

    it('Given a quick start profile with root user, When generating YAML, Then PUID/PGID should not be included', () => {
      // Given
      const config = createQuickStartConfig({
        workdirCreatedByRoot: true
      });

      // When
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).not.toContain('PUID:');
      expect(result).not.toContain('PGID:');
    });
  });

  describe('Scenario 3: ZAI API Provider', () => {
    it('Given a ZAI provider configuration, When generating YAML, Then ZAI-specific settings should be included', () => {
      // Given
      const config = createZaiProviderConfig();

      // When
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain(`# ${getBuilderMessage('zh-CN', 'docker-compose:generator.providers.zai.heading')}`);
      expect(result).toContain('ANTHROPIC_URL: "https://open.bigmodel.cn/api/anthropic"');
      expect(result).toContain('ANTHROPIC_AUTH_TOKEN: "test-token"');
    });
  });

  describe('Scenario 4: Anthropic API Provider', () => {
    it('Given an Anthropic provider configuration, When generating YAML, Then Anthropic-specific settings should be included', () => {
      // Given
      const config = createAnthropicProviderConfig();

      // When
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain(`# ${getBuilderMessage('zh-CN', 'docker-compose:generator.providers.anthropic.heading')}`);
      expect(result).toContain('ANTHROPIC_AUTH_TOKEN: "test-token"');
      expect(result).not.toContain('ANTHROPIC_URL:');
    });
  });

  describe('Scenario 5: Custom API Provider', () => {
    it('Given a custom provider configuration, When generating YAML, Then custom API endpoint should be included', () => {
      // Given
      const config = createCustomProviderConfig({
        anthropicUrl: 'https://custom-api.example.com'
      });

      // When
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain(`# ${getBuilderMessage('zh-CN', 'docker-compose:generator.providers.custom.heading')}`);
      expect(result).toContain('ANTHROPIC_URL: "https://custom-api.example.com"');
      expect(result).toContain(`# ${getBuilderMessage('zh-CN', 'docker-compose:generator.providers.custom.providerLabel')}`);
    });
  });

  describe('Scenario 6: Language Support', () => {
    it('Given Chinese language setting, When generating YAML, Then Chinese support information should be included', () => {
      // Given
      const config = createQuickStartConfig();

      // When
      const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain(`# ${getBuilderMessage('zh-CN', 'docker-compose:generator.support.title')}`);
      expect(result).toContain(`# ${getBuilderMessage('zh-CN', 'docker-compose:generator.support.description')}`);
    });

    it('Given English language setting, When generating YAML, Then English support information should be included', () => {
      // Given
      const config = createQuickStartConfig();

      // When
      const result = generateYAML(config, undefined, 'en-US', FIXED_DATE);

      // Then
      expect(result).toContain(`# ${getBuilderMessage('en-US', 'docker-compose:generator.support.title')}`);
      expect(result).toContain(`# ${getBuilderMessage('en-US', 'docker-compose:generator.support.description')}`);
    });
  });
});
