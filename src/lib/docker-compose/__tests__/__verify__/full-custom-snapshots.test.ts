import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import {
  createWindowsConfig,
  createLinuxNonRootConfig,
  createExternalDbConfig,
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
  it('should generate valid YAML structure for Windows deployment with internal database', async () => {
    const config = createWindowsConfig({
      databaseType: 'internal',
      volumeType: 'named',
      volumeName: 'postgres-data'
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证服务存在
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(true);
    expect(hasVolume(yaml, 'postgres-data')).toBe(true);

    // 验证 Windows 路径
    const volumes = getServiceVolumes(yaml, 'hagicode');
    expect(volumes).toContain('C:\\\\repos:/app/workdir');

    // 验证没有 PUID/PGID（Windows 不需要）
    expect(hasEnvVar(yaml, 'hagicode', 'PUID')).toBe(false);
    expect(hasEnvVar(yaml, 'hagicode', 'PGID')).toBe(false);

    expect(yaml).toMatchSnapshot('full-custom-windows-internal-db-zh-CN');
  });

  it('should generate valid YAML structure for Linux root user with internal database', async () => {
    const config = createMockConfig({
      hostOS: 'linux',
      workdirCreatedByRoot: true,
      databaseType: 'internal',
      volumeType: 'named',
      volumeName: 'postgres-data'
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证服务存在
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(true);
    expect(hasVolume(yaml, 'postgres-data')).toBe(true);

    // 验证 Linux 路径
    const volumes = getServiceVolumes(yaml, 'hagicode');
    expect(volumes).toContain('/home/user/repos:/app/workdir');

    // 验证没有 PUID/PGID（root 用户不需要）
    expect(hasEnvVar(yaml, 'hagicode', 'PUID')).toBe(false);
    expect(hasEnvVar(yaml, 'hagicode', 'PGID')).toBe(false);

    expect(yaml).toMatchSnapshot('full-custom-linux-root-internal-db-zh-CN');
  });

  it('should generate valid YAML structure for Linux non-root user with internal database', async () => {
    const config = createLinuxNonRootConfig({
      databaseType: 'internal',
      volumeType: 'named',
      volumeName: 'postgres-data'
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.errors).toEqual([]);
    expect(validation.valid).toBe(true);

    // 验证服务存在
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(true);
    expect(hasVolume(yaml, 'postgres-data')).toBe(true);

    // 验证 Linux 路径
    const volumes = getServiceVolumes(yaml, 'hagicode');
    expect(volumes).toContain('/home/user/repos:/app/workdir');

    // 验证 PUID/PGID（非 root 用户需要）
    expect(hasEnvVar(yaml, 'hagicode', 'PUID')).toBe(true);
    expect(hasEnvVar(yaml, 'hagicode', 'PGID')).toBe(true);
    expect(getServiceEnvVar(yaml, 'hagicode', 'PUID')).toBe('1000');
    expect(getServiceEnvVar(yaml, 'hagicode', 'PGID')).toBe('1000');

    expect(yaml).toMatchSnapshot('full-custom-linux-nonroot-internal-db-zh-CN');
  });

  it('should generate valid YAML structure for external database configuration', async () => {
    const config = createExternalDbConfig({
      externalDbHost: 'external-postgres.example.com',
      externalDbPort: '5432'
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);

    // 验证只有 hagicode 服务
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(false);

    // 验证只有 hagicode_data 卷（没有 postgres-data）
    expect(validation.parsed.volumes).toBeDefined();
    expect(validation.parsed.volumes?.hagicode_data).toBeDefined();
    expect(validation.parsed.volumes?.postgres_data).toBeUndefined();

    // 验证外部数据库连接字符串
    const connectionString = getServiceEnvVar(yaml, 'hagicode', 'ConnectionStrings__Default');
    expect(connectionString).toContain('Host=external-postgres.example.com');
    expect(connectionString).toContain('Port=5432');

    expect(yaml).toMatchSnapshot('full-custom-external-db-zh-CN');
  });

  it('should generate valid YAML structure for bind mount volume configuration', async () => {
    const config = createMockConfig({
      hostOS: 'linux',
      databaseType: 'internal',
      volumeType: 'bind',
      volumePath: '/data/postgres',
      workdirCreatedByRoot: false,
      puid: '1000',
      pgid: '1000'
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);

    // 验证服务存在
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(true);

    // 验证 postgres 使用绑定挂载
    const postgresVolumes = getServiceVolumes(yaml, 'postgres');
    expect(postgresVolumes).toContain('/data/postgres:/bitnami/postgresql');

    // 验证只有 hagicode_data 卷（没有 postgres-data，因为使用绑定挂载）
    expect(validation.parsed.volumes).toBeDefined();
    expect(validation.parsed.volumes?.hagicode_data).toBeDefined();
    expect(validation.parsed.volumes?.postgres_data).toBeUndefined();

    // 验证 PUID/PGID
    expect(hasEnvVar(yaml, 'hagicode', 'PUID')).toBe(true);
    expect(getServiceEnvVar(yaml, 'hagicode', 'PUID')).toBe('1000');

    expect(yaml).toMatchSnapshot('full-custom-linux-bind-mount-zh-CN');
  });

  it('should validate volume mount paths for different OS', async () => {
    // Windows 测试
    const windowsConfig = createWindowsConfig({
      databaseType: 'internal',
      volumeType: 'bind',
      volumePath: 'C:\\\\data\\\\postgres'
    });
    const windowsYaml = generateYAML(windowsConfig, undefined, 'zh-CN', FIXED_DATE);

    const windowsValidation = validateDockerComposeStructure(windowsYaml);
    expect(windowsValidation.valid).toBe(true);

    const postgresVolumes = getServiceVolumes(windowsYaml, 'postgres');
    expect(postgresVolumes).toContain('C:\\\\data\\\\postgres:/bitnami/postgresql');

    // Linux 测试
    const linuxConfig = createMockConfig({
      hostOS: 'linux',
      databaseType: 'internal',
      volumeType: 'bind',
      volumePath: '/mnt/data/postgres'
    });
    const linuxYaml = generateYAML(linuxConfig, undefined, 'zh-CN', FIXED_DATE);

    const linuxValidation = validateDockerComposeStructure(linuxYaml);
    expect(linuxValidation.valid).toBe(true);

    const linuxPostgresVolumes = getServiceVolumes(linuxYaml, 'postgres');
    expect(linuxPostgresVolumes).toContain('/mnt/data/postgres:/bitnami/postgresql');
  });

  it('should keep only retained executor volumes in full custom mode', async () => {
    const config = createMockConfig({
      profile: 'full-custom',
      enabledExecutors: ['codex', 'opencode'],
      anthropicAuthToken: '',
      codexApiKey: 'test-codex-key',
      openCodeModel: 'anthropic/claude-sonnet-4',
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);

    const volumes = getServiceVolumes(yaml, 'hagicode');
    expect(volumes).toContain('codex-data:/home/hagicode/.codex');
    expect(volumes).toContain('opencode-config-data:/home/hagicode/.config/opencode');
    expect(volumes).toContain('opencode-auth-data:/home/hagicode/.local/share/opencode');
    expect(volumes).toContain('opencode-models-data:/home/hagicode/.cache/opencode');
    expect(hasVolume(yaml, 'codebuddy-data')).toBe(false);
    expect(hasVolume(yaml, 'kimi-data')).toBe(false);
    expect(hasVolume(yaml, 'qoder-data')).toBe(false);
    expect(hasVolume(yaml, 'kiro-data')).toBe(false);

    expect(yaml).toMatchSnapshot('full-custom-retained-executor-volumes-zh-CN');
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

  it('should not emit removed executor services or volumes in full custom mode', async () => {
    const config = createMockConfig({
      profile: 'full-custom',
      enabledExecutors: ['claude', 'codex'],
      codexApiKey: 'test-codex-key',
      anthropicAuthToken: '',
    });
    const yaml = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);
    expect(hasService(yaml, 'copilot-cli')).toBe(false);
    expect(hasVolume(yaml, 'copilot-data')).toBe(false);
    expect(hasVolume(yaml, 'codebuddy-data')).toBe(false);
    expect(hasVolume(yaml, 'qoder-data')).toBe(false);
    expect(yaml).not.toContain('COPILOT_API_KEY');

    expect(yaml).toMatchSnapshot('full-custom-no-removed-executors-zh-CN');
  });
});
