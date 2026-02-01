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
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

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
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

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
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

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
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);

    // 验证只有 hagicode 服务
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(false);

    // 验证没有顶层卷配置
    expect(validation.parsed.volumes).toBeUndefined();

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
    const yaml = generateYAML(config, 'zh-CN', FIXED_DATE);

    // 验证 YAML 结构
    const validation = validateDockerComposeStructure(yaml);
    expect(validation.valid).toBe(true);

    // 验证服务存在
    expect(hasService(yaml, 'hagicode')).toBe(true);
    expect(hasService(yaml, 'postgres')).toBe(true);

    // 验证 postgres 使用绑定挂载
    const postgresVolumes = getServiceVolumes(yaml, 'postgres');
    expect(postgresVolumes).toContain('/data/postgres:/bitnami/postgresql');

    // 验证没有顶层卷配置（绑定挂载不需要）
    expect(validation.parsed.volumes).toBeUndefined();

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
    const windowsYaml = generateYAML(windowsConfig, 'zh-CN', FIXED_DATE);

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
    const linuxYaml = generateYAML(linuxConfig, 'zh-CN', FIXED_DATE);

    const linuxValidation = validateDockerComposeStructure(linuxYaml);
    expect(linuxValidation.valid).toBe(true);

    const linuxPostgresVolumes = getServiceVolumes(linuxYaml, 'postgres');
    expect(linuxPostgresVolumes).toContain('/mnt/data/postgres:/bitnami/postgresql');
  });
});
