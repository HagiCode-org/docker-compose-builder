import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import {
  createWindowsConfig,
  createLinuxNonRootConfig,
  createMockConfig,
  FIXED_DATE
} from '../helpers/config';
import {
  validateDockerComposeStructure,
  hasService,
  hasVolume,
  hasEnvVar,
  getServiceEnvVar,
  getServiceVolumes
} from '../helpers/yaml';

describe('Full Custom Profiles - Complete File Verification with YAML Parsing', () => {
  it('should generate valid YAML structure for Windows deployment in SQLite-only mode', async () => {
    const config = createWindowsConfig({
      profile: 'full-custom',
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(false);
    expect(hasVolume(yaml, 'hagicode_data')).toBe(true);
    expect(hasVolume(yaml, 'hagicode_saves')).toBe(true);
    expect(getServiceVolumes(yaml, 'hagicode')).toContain('C:\\\\repos:/app/workdir');
    expect(hasEnvVar(yaml, 'hagicode', 'PUID')).toBe(false);
    expect(hasEnvVar(yaml, 'hagicode', 'PGID')).toBe(false);

    expect(yaml).toMatchSnapshot('full-custom-windows-sqlite-zh-CN');
  });

  it('should generate valid YAML structure for Linux root user in SQLite-only mode', async () => {
    const config = createMockConfig({
      profile: 'full-custom',
      hostOS: 'linux',
      workdirCreatedByRoot: true,
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(false);
    expect(hasEnvVar(yaml, 'hagicode', 'PUID')).toBe(false);
    expect(hasEnvVar(yaml, 'hagicode', 'PGID')).toBe(false);
    expect(getServiceVolumes(yaml, 'hagicode')).toContain('/home/user/repos:/app/workdir');

    expect(yaml).toMatchSnapshot('full-custom-linux-root-sqlite-zh-CN');
  });

  it('should generate valid YAML structure for Linux non-root user in SQLite-only mode', async () => {
    const config = createLinuxNonRootConfig({
      profile: 'full-custom',
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(false);
    expect(hasEnvVar(yaml, 'hagicode', 'PUID')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'PGID')).toBe(true);
    expect(getServiceEnvVar(yaml, 'hagicode', 'PUID')).toBe('1000');
    expect(getServiceEnvVar(yaml, 'hagicode', 'PGID')).toBe('1000');
    expect(getServiceEnvVar(yaml, 'hagicode', 'ConnectionStrings__Default')).toBe('Data Source=/app/data/hagicode.db');

    expect(yaml).toMatchSnapshot('full-custom-linux-nonroot-sqlite-zh-CN');
  });

  it('should keep the database contract free of postgres services, env vars, and named volumes', async () => {
    const config = createMockConfig({
      profile: 'full-custom',
      enabledExecutors: ['claude', 'codex'],
      codexApiKey: 'test-codex-key',
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(false);
    expect(hasVolume(yaml, 'postgres-data')).toBe(false);
    expect(yaml).not.toContain('Database__Provider: postgresql');
    expect(yaml).not.toContain('POSTGRES_PASSWORD');
    expect(yaml).not.toContain('pg_isready');
    expect(validation.parsed?.services?.hagicode?.depends_on).toBeUndefined();

    expect(yaml).toMatchSnapshot('full-custom-no-postgres-artifacts-zh-CN');
  });

  it('should export an OpenCode host-file bind mount in full custom mode', async () => {
    const config = createMockConfig({
      profile: 'full-custom',
      enabledExecutors: ['opencode'],
      anthropicAuthToken: '',
      hostOS: 'linux',
      openCodeConfigMode: 'host-file',
      openCodeConfigHostPath: '/srv/opencode/opencode.json',
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);
    expect(hasVolume(yaml, 'opencode-config-data')).toBe(false);
    expect(getServiceVolumes(yaml, 'hagicode')).toContain('/srv/opencode/opencode.json:/home/hagicode/.config/opencode/opencode.json');

    expect(yaml).toMatchSnapshot('full-custom-opencode-host-file-zh-CN');
  });
});
