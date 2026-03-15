import { describe, it, expect } from 'vitest';
import { parseCopilotReleaseMetadata } from '../../releaseIndexLoader';
import { createCopilotTemplateDefaults, getServiceTemplates, validateCopilotImageTag } from '../../serviceTemplates';
import { generateYAML } from '../../generator';
import { createMockConfig, FIXED_DATE } from '../helpers/config';

describe('serviceTemplates', () => {
  it('should register copilot-cli template in template registry', () => {
    const templates = getServiceTemplates();
    const copilotTemplate = templates.find((template) => template.id === 'copilot-cli');

    expect(copilotTemplate).toBeDefined();
    expect(copilotTemplate?.requiredEnv).toContain('COPILOT_API_KEY');
  });

  it('should parse copilot metadata from release index payload', () => {
    const payload = {
      schemaVersion: '1.0',
      copilot: {
        provider: 'copilot-cli',
        imageTag: '1.2.3-copilot',
        imageDigest: 'sha256:deadbeef',
        envSchemaVersion: '1.0',
        compatibility: {
          minComposeSchema: '3.9',
          architectures: ['linux/amd64', 'linux/arm64']
        }
      }
    };

    const parsed = parseCopilotReleaseMetadata(payload);
    expect(parsed).not.toBeNull();
    expect(parsed?.provider).toBe('copilot-cli');
    expect(parsed?.imageTag).toBe('1.2.3-copilot');
  });

  it('should map release metadata to copilot template defaults', () => {
    const defaults = createCopilotTemplateDefaults({
      provider: 'copilot-cli',
      imageTag: '2.0.0-copilot',
      imageDigest: 'sha256:deadbeef',
      envSchemaVersion: '1.1',
      compatibility: {
        minComposeSchema: '3.9',
        architectures: ['linux/amd64']
      }
    });

    expect(defaults.enabledExecutors).toEqual(['copilot-cli']);
    expect(defaults.imageTag).toBe('2.0.0-copilot');
  });

  it('should validate copilot image tag policy', () => {
    expect(validateCopilotImageTag('1.2.3-copilot')).toBe(true);
    expect(validateCopilotImageTag('1.2.3')).toBe(false);
  });

  it('should support end-to-end chain from release metadata to compose generation', () => {
    const metadata = parseCopilotReleaseMetadata({
      schemaVersion: '1.0',
      copilot: {
        provider: 'copilot-cli',
        imageTag: '1.2.3-copilot',
        imageDigest: 'sha256:deadbeef',
        envSchemaVersion: '1.0',
        compatibility: {
          minComposeSchema: '3.9',
          architectures: ['linux/amd64', 'linux/arm64']
        }
      }
    });

    expect(metadata).not.toBeNull();
    const config = createMockConfig({
      ...createCopilotTemplateDefaults(metadata!),
      copilotApiKey: 'test-key',
      workdirPath: '/workspace',
      copilotMountWorkspace: true
    });

    const yaml = generateYAML(config, undefined, 'en-US', FIXED_DATE);
    expect(yaml).toContain('copilot-cli:');
    expect(yaml).toContain('COPILOT_API_KEY: "test-key"');
    expect(yaml).toContain('1.2.3-copilot');
  });
});
