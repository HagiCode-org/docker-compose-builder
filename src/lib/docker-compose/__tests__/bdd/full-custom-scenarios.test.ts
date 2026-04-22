import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import {
  createWindowsConfig,
  createLinuxNonRootConfig,
  createMockConfig,
  FIXED_DATE
} from '../helpers/config';

describe('Docker Compose Generation: Full Custom Profile', () => {
  it('Given a Windows host OS, When generating YAML, Then Windows-specific paths should be used', () => {
    const config = createWindowsConfig({ profile: 'full-custom' });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).toContain('- C:\\\\repos:/app/workdir');
    expect(result).not.toContain('postgres:');
  });

  it('Given a Linux host OS with root user, When generating YAML, Then PUID and PGID should not be included', () => {
    const config = createMockConfig({
      profile: 'full-custom',
      hostOS: 'linux',
      workdirCreatedByRoot: true
    });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).not.toContain('PUID:');
    expect(result).not.toContain('PGID:');
  });

  it('Given a Linux host OS with non-root user, When generating YAML, Then PUID and PGID should be included', () => {
    const config = createLinuxNonRootConfig({ profile: 'full-custom' });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).toContain('PUID: 1000');
    expect(result).toContain('PGID: 1000');
  });

  it('Given full-custom mode, When generating YAML, Then SQLite-only output should be emitted', () => {
    const config = createLinuxNonRootConfig({ profile: 'full-custom' });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).toContain('Database__Provider: sqlite');
    expect(result).toContain('ConnectionStrings__Default: "Data Source=/app/data/hagicode.db"');
    expect(result).not.toContain('Database__Provider: postgresql');
    expect(result).not.toContain('postgres:');
    expect(result).not.toContain('postgres-data:');
    expect(result).toContain('hagicode_data:/app/data');
    expect(result).toContain('hagicode_saves:/app/saves');
  });

  it('Given full-custom mode with Code Server publishing, When generating YAML, Then loopback publishing should be emitted', () => {
    const config = createMockConfig({
      profile: 'full-custom',
      codeServerHost: '0.0.0.0',
      codeServerPort: '36529',
      codeServerPublishToHost: true,
      codeServerPublishedPort: '36531',
    });
    const result = generateYAML(config, undefined, 'zh-CN', FIXED_DATE);

    expect(result).toContain('127.0.0.1:36531:36529');
  });
});
