import { describe, it, expect } from 'vitest';
import { generateYAML } from '../../generator';
import {
  createWindowsConfig,
  createLinuxNonRootConfig,
  createExternalDbConfig,
  createMockConfig,
  FIXED_DATE
} from '../helpers/config';

describe('Docker Compose Generation: Full Custom Profile', () => {
  describe('Scenario 1: Windows Deployment Configuration', () => {
    it('Given a Windows host OS, When generating YAML, Then Windows-specific paths should be used', () => {
      // Given
      const config = createWindowsConfig();

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- C:\\\\repos:/app/workdir');
    });

    it('Given a Windows host OS with internal database, When generating YAML, Then volume paths should use Windows format', () => {
      // Given
      const config = createWindowsConfig({
        databaseType: 'internal',
        volumeType: 'bind',
        volumePath: 'C:\\\\data\\\\postgres'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- C:\\\\data\\\\postgres:/bitnami/postgresql');
    });
  });

  describe('Scenario 2: Linux Root User Configuration', () => {
    it('Given a Linux host OS with root user, When generating YAML, Then PUID/PGID should not be included', () => {
      // Given
      const config = createMockConfig({
        hostOS: 'linux',
        workdirCreatedByRoot: true
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).not.toContain('PUID:');
      expect(result).not.toContain('PGID:');
    });

    it('Given a Linux root user, When generating YAML, Then Linux paths should be used', () => {
      // Given
      const config = createMockConfig({
        hostOS: 'linux',
        workdirCreatedByRoot: true
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- /home/user/repos:/app/workdir');
    });
  });

  describe('Scenario 3: Linux Non-Root User Configuration', () => {
    it('Given a Linux host OS with non-root user, When generating YAML, Then PUID/PGID should be included', () => {
      // Given
      const config = createLinuxNonRootConfig();

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('PUID: 1000');
      expect(result).toContain('PGID: 1000');
    });

    it('Given a Linux non-root user, When generating YAML, Then user mapping should be in environment section', () => {
      // Given
      const config = createLinuxNonRootConfig();

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('environment:');
      expect(result).toContain('PUID: 1000');
      expect(result).toContain('PGID: 1000');
    });
  });

  describe('Scenario 4: Internal Database with Named Volume', () => {
    it('Given an internal database with named volume, When generating YAML, Then volume section should be included', () => {
      // Given
      const config = createLinuxNonRootConfig({
        databaseType: 'internal',
        volumeType: 'named',
        volumeName: 'postgres-data'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('volumes:');
      expect(result).toContain('postgres-data:');
    });

    it('Given an internal database with named volume, When generating YAML, Then postgres service should use named volume', () => {
      // Given
      const config = createLinuxNonRootConfig({
        databaseType: 'internal',
        volumeType: 'named',
        volumeName: 'custom-postgres-vol'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- custom-postgres-vol:/bitnami/postgresql');
    });
  });

  describe('Scenario 5: Internal Database with Bind Mount', () => {
    it('Given an internal database with bind mount, When generating YAML, Then volume section should not be included', () => {
      // Given
      const config = createMockConfig({
        databaseType: 'internal',
        volumeType: 'bind',
        volumePath: '/data/postgres',
        hostOS: 'linux'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then - check that there's no top-level volumes section
      const networksIndex = result.indexOf('\nnetworks:');
      const beforeNetworks = result.substring(0, networksIndex);
      expect(beforeNetworks).not.toContain('\nvolumes:');
    });

    it('Given an internal database with bind mount, When generating YAML, Then postgres service should use bind mount', () => {
      // Given
      const config = createLinuxNonRootConfig({
        databaseType: 'internal',
        volumeType: 'bind',
        volumePath: '/custom/data/postgres'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('- /custom/data/postgres:/bitnami/postgresql');
    });
  });

  describe('Scenario 6: External Database Configuration', () => {
    it('Given an external database configuration, When generating YAML, Then postgres service should not be included', () => {
      // Given
      const config = createExternalDbConfig();

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('hagicode:');
      expect(result).not.toContain('postgres:');
    });

    it('Given an external database configuration, When generating YAML, Then connection string should use external host', () => {
      // Given
      const config = createExternalDbConfig({
        externalDbHost: 'external-db.example.com',
        externalDbPort: '5433'
      });

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then
      expect(result).toContain('ConnectionStrings__Default: "Host=external-db.example.com;Port=5433');
    });

    it('Given an external database configuration, When generating YAML, Then volumes section should not be included', () => {
      // Given
      const config = createExternalDbConfig();

      // When
      const result = generateYAML(config, 'zh-CN', FIXED_DATE);

      // Then - check that there's no top-level volumes section
      const servicesEnd = result.indexOf('restart: unless-stopped');
      const afterServices = result.substring(servicesEnd);
      expect(afterServices).not.toContain('\nvolumes:');
    });
  });
});
