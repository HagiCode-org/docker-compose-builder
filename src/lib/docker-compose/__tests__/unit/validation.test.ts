import { describe, it, expect } from 'vitest';
import { validateConfig, isValidConfig } from '../../validation';
import { createMockConfig } from '../helpers/config';

describe('validateConfig', () => {
  describe('HTTP port validation', () => {
    it('should accept valid port numbers', () => {
      const config = createMockConfig({ httpPort: '8080' });
      const errors = validateConfig(config);

      const portErrors = errors.filter(e => e.field === 'httpPort');
      expect(portErrors).toHaveLength(0);
    });

    it('should reject invalid port numbers', () => {
      const config = createMockConfig({ httpPort: 'invalid' });
      const errors = validateConfig(config);

      const portErrors = errors.filter(e => e.field === 'httpPort');
      expect(portErrors).toHaveLength(1);
      expect(portErrors[0].message).toContain('must be a valid number');
    });

    it('should reject port numbers out of range (too low)', () => {
      const config = createMockConfig({ httpPort: '0' });
      const errors = validateConfig(config);

      const portErrors = errors.filter(e => e.field === 'httpPort');
      expect(portErrors).toHaveLength(1);
      expect(portErrors[0].message).toContain('between 1 and 65535');
    });

    it('should reject port numbers out of range (too high)', () => {
      const config = createMockConfig({ httpPort: '65536' });
      const errors = validateConfig(config);

      const portErrors = errors.filter(e => e.field === 'httpPort');
      expect(portErrors).toHaveLength(1);
      expect(portErrors[0].message).toContain('between 1 and 65535');
    });

    it('should accept port number at lower boundary', () => {
      const config = createMockConfig({ httpPort: '1' });
      const errors = validateConfig(config);

      const portErrors = errors.filter(e => e.field === 'httpPort');
      expect(portErrors).toHaveLength(0);
    });

    it('should accept port number at upper boundary', () => {
      const config = createMockConfig({ httpPort: '65535' });
      const errors = validateConfig(config);

      const portErrors = errors.filter(e => e.field === 'httpPort');
      expect(portErrors).toHaveLength(0);
    });
  });

  describe('Container name validation', () => {
    it('should accept valid container name', () => {
      const config = createMockConfig({ containerName: 'hagicode' });
      const errors = validateConfig(config);

      const nameErrors = errors.filter(e => e.field === 'containerName');
      expect(nameErrors).toHaveLength(0);
    });

    it('should reject empty container name', () => {
      const config = createMockConfig({ containerName: '' });
      const errors = validateConfig(config);

      const nameErrors = errors.filter(e => e.field === 'containerName');
      expect(nameErrors).toHaveLength(1);
      expect(nameErrors[0].message).toContain('is required');
    });

    it('should reject whitespace-only container name', () => {
      const config = createMockConfig({ containerName: '   ' });
      const errors = validateConfig(config);

      const nameErrors = errors.filter(e => e.field === 'containerName');
      expect(nameErrors).toHaveLength(1);
    });
  });

  describe('Image tag validation', () => {
    it('should accept valid image tag', () => {
      const config = createMockConfig({ imageTag: 'latest' });
      const errors = validateConfig(config);

      const tagErrors = errors.filter(e => e.field === 'imageTag');
      expect(tagErrors).toHaveLength(0);
    });

    it('should reject empty image tag', () => {
      const config = createMockConfig({ imageTag: '' });
      const errors = validateConfig(config);

      const tagErrors = errors.filter(e => e.field === 'imageTag');
      expect(tagErrors).toHaveLength(1);
      expect(tagErrors[0].message).toContain('is required');
    });
  });

  describe('Internal database validation', () => {
    it('should accept valid internal database configuration', () => {
      const config = createMockConfig({
        databaseType: 'internal',
        postgresDatabase: 'hagicode',
        postgresUser: 'postgres',
        postgresPassword: 'password',
        volumeType: 'named',
        volumeName: 'postgres-data'
      });
      const errors = validateConfig(config);

      const dbErrors = errors.filter(e =>
        e.field.startsWith('postgres') ||
        e.field.startsWith('volume')
      );
      expect(dbErrors).toHaveLength(0);
    });

    it('should reject missing database name', () => {
      const config = createMockConfig({
        databaseType: 'internal',
        postgresDatabase: ''
      });
      const errors = validateConfig(config);

      const dbErrors = errors.filter(e => e.field === 'postgresDatabase');
      expect(dbErrors).toHaveLength(1);
    });

    it('should reject missing database user', () => {
      const config = createMockConfig({
        databaseType: 'internal',
        postgresUser: ''
      });
      const errors = validateConfig(config);

      const userErrors = errors.filter(e => e.field === 'postgresUser');
      expect(userErrors).toHaveLength(1);
    });

    it('should reject missing database password', () => {
      const config = createMockConfig({
        databaseType: 'internal',
        postgresPassword: ''
      });
      const errors = validateConfig(config);

      const passErrors = errors.filter(e => e.field === 'postgresPassword');
      expect(passErrors).toHaveLength(1);
    });

    it('should reject missing volume name for named volumes', () => {
      const config = createMockConfig({
        databaseType: 'internal',
        volumeType: 'named',
        volumeName: ''
      });
      const errors = validateConfig(config);

      const volErrors = errors.filter(e => e.field === 'volumeName');
      expect(volErrors).toHaveLength(1);
      expect(volErrors[0].message).toContain('Volume name is required for named volumes');
    });

    it('should reject missing volume path for bind mounts', () => {
      const config = createMockConfig({
        databaseType: 'internal',
        volumeType: 'bind',
        volumePath: ''
      });
      const errors = validateConfig(config);

      const volErrors = errors.filter(e => e.field === 'volumePath');
      expect(volErrors).toHaveLength(1);
      expect(volErrors[0].message).toContain('Volume path is required for bind mounts');
    });
  });

  describe('External database validation', () => {
    it('should accept valid external database configuration', () => {
      const config = createMockConfig({
        databaseType: 'external',
        externalDbHost: 'localhost',
        externalDbPort: '5432',
        postgresDatabase: 'hagicode',
        postgresUser: 'postgres',
        postgresPassword: 'password'
      });
      const errors = validateConfig(config);

      const dbErrors = errors.filter(e =>
        e.field.startsWith('postgres') ||
        e.field.startsWith('externalDb')
      );
      expect(dbErrors).toHaveLength(0);
    });

    it('should reject missing external database host', () => {
      const config = createMockConfig({
        databaseType: 'external',
        externalDbHost: ''
      });
      const errors = validateConfig(config);

      const hostErrors = errors.filter(e => e.field === 'externalDbHost');
      expect(hostErrors).toHaveLength(1);
      expect(hostErrors[0].message).toContain('External database host is required');
    });

    it('should reject invalid external database port', () => {
      const config = createMockConfig({
        databaseType: 'external',
        externalDbPort: 'invalid'
      });
      const errors = validateConfig(config);

      const portErrors = errors.filter(e => e.field === 'externalDbPort');
      expect(portErrors).toHaveLength(1);
      expect(portErrors[0].message).toContain('must be a valid number');
    });
  });

  describe('License key validation', () => {
    it('should require license key for custom license type', () => {
      const config = createMockConfig({
        licenseKeyType: 'custom',
        licenseKey: ''
      });
      const errors = validateConfig(config);

      const keyErrors = errors.filter(e => e.field === 'licenseKey');
      expect(keyErrors).toHaveLength(1);
      expect(keyErrors[0].message).toContain('Custom license key is required');
    });

    it('should not require license key for public license type', () => {
      const config = createMockConfig({
        licenseKeyType: 'public',
        licenseKey: ''
      });
      const errors = validateConfig(config);

      const keyErrors = errors.filter(e => e.field === 'licenseKey');
      expect(keyErrors).toHaveLength(0);
    });
  });

  describe('Anthropic API validation', () => {
    it('should require API token', () => {
      const config = createMockConfig({
        anthropicAuthToken: ''
      });
      const errors = validateConfig(config);

      const tokenErrors = errors.filter(e => e.field === 'anthropicAuthToken');
      expect(tokenErrors).toHaveLength(1);
      expect(tokenErrors[0].message).toContain('API token is required');
    });

    it('should require API URL for custom provider', () => {
      const config = createMockConfig({
        anthropicApiProvider: 'custom',
        anthropicUrl: ''
      });
      const errors = validateConfig(config);

      const urlErrors = errors.filter(e => e.field === 'anthropicUrl');
      expect(urlErrors).toHaveLength(1);
      expect(urlErrors[0].message).toContain('API endpoint URL is required for custom provider');
    });

    it('should not require API URL for Anthropic provider', () => {
      const config = createMockConfig({
        anthropicApiProvider: 'anthropic',
        anthropicUrl: ''
      });
      const errors = validateConfig(config);

      const urlErrors = errors.filter(e => e.field === 'anthropicUrl');
      expect(urlErrors).toHaveLength(0);
    });
  });

  describe('Work directory validation', () => {
    it('should reject empty work directory path', () => {
      const config = createMockConfig({
        workdirPath: ''
      });
      const errors = validateConfig(config);

      const pathErrors = errors.filter(e => e.field === 'workdirPath');
      expect(pathErrors).toHaveLength(1);
      expect(pathErrors[0].message).toContain('Work directory path is required');
    });
  });

  describe('PUID/PGID validation for Linux', () => {
    it('should require valid PUID for Linux non-root user', () => {
      const config = createMockConfig({
        hostOS: 'linux',
        workdirCreatedByRoot: false,
        puid: 'invalid'
      });
      const errors = validateConfig(config);

      const puidErrors = errors.filter(e => e.field === 'puid');
      expect(puidErrors).toHaveLength(1);
      expect(puidErrors[0].message).toContain('must be a valid number');
    });

    it('should require valid PGID for Linux non-root user', () => {
      const config = createMockConfig({
        hostOS: 'linux',
        workdirCreatedByRoot: false,
        pgid: 'invalid'
      });
      const errors = validateConfig(config);

      const pgidErrors = errors.filter(e => e.field === 'pgid');
      expect(pgidErrors).toHaveLength(1);
      expect(pgidErrors[0].message).toContain('must be a valid number');
    });

    it('should not require PUID/PGID for Linux root user', () => {
      const config = createMockConfig({
        hostOS: 'linux',
        workdirCreatedByRoot: true,
        puid: '',
        pgid: ''
      });
      const errors = validateConfig(config);

      const puidErrors = errors.filter(e => e.field === 'puid');
      const pgidErrors = errors.filter(e => e.field === 'pgid');
      expect(puidErrors).toHaveLength(0);
      expect(pgidErrors).toHaveLength(0);
    });
  });
});

describe('isValidConfig', () => {
  it('should return true for valid configuration', () => {
    const config = createMockConfig();
    expect(isValidConfig(config)).toBe(true);
  });

  it('should return false for invalid configuration', () => {
    const config = createMockConfig({
      httpPort: 'invalid',
      containerName: ''
    });
    expect(isValidConfig(config)).toBe(false);
  });

  it('should return true for valid internal database configuration', () => {
    const config = createMockConfig({
      databaseType: 'internal',
      postgresDatabase: 'testdb',
      postgresUser: 'testuser',
      postgresPassword: 'testpass',
      volumeType: 'named',
      volumeName: 'test-vol'
    });
    expect(isValidConfig(config)).toBe(true);
  });

  it('should return true for valid external database configuration', () => {
    const config = createMockConfig({
      databaseType: 'external',
      externalDbHost: 'localhost',
      externalDbPort: '5432',
      postgresDatabase: 'testdb',
      postgresUser: 'testuser',
      postgresPassword: 'testpass'
    });
    expect(isValidConfig(config)).toBe(true);
  });
});
