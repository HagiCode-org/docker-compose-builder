import type { DockerComposeConfig } from './types';

/**
 * Validation errors interface
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Validate Docker Compose configuration
 * @param config The configuration to validate
 * @returns Array of validation errors (empty if valid)
 */
export function validateConfig(config: DockerComposeConfig): ValidationError[] {
  const errors: ValidationError[] = [];

  // Validate HTTP port
  if (!config.httpPort || isNaN(parseInt(config.httpPort))) {
    errors.push({ field: 'httpPort', message: 'HTTP port must be a valid number' });
  } else if (parseInt(config.httpPort) < 1 || parseInt(config.httpPort) > 65535) {
    errors.push({ field: 'httpPort', message: 'HTTP port must be between 1 and 65535' });
  }

  // Validate container name
  if (!config.containerName || config.containerName.trim() === '') {
    errors.push({ field: 'containerName', message: 'Container name is required' });
  }

  // Validate image tag
  if (!config.imageTag || config.imageTag.trim() === '') {
    errors.push({ field: 'imageTag', message: 'Image tag is required' });
  }

  // Validate database configuration
  if (config.databaseType === 'internal') {
    if (!config.postgresDatabase || config.postgresDatabase.trim() === '') {
      errors.push({ field: 'postgresDatabase', message: 'Database name is required' });
    }
    if (!config.postgresUser || config.postgresUser.trim() === '') {
      errors.push({ field: 'postgresUser', message: 'Database user is required' });
    }
    if (!config.postgresPassword || config.postgresPassword.trim() === '') {
      errors.push({ field: 'postgresPassword', message: 'Database password is required' });
    }

    if (config.volumeType === 'named') {
      if (!config.volumeName || config.volumeName.trim() === '') {
        errors.push({ field: 'volumeName', message: 'Volume name is required for named volumes' });
      }
    } else if (config.volumeType === 'bind') {
      if (!config.volumePath || config.volumePath.trim() === '') {
        errors.push({ field: 'volumePath', message: 'Volume path is required for bind mounts' });
      }
    }
  } else if (config.databaseType === 'external') {
    if (!config.externalDbHost || config.externalDbHost.trim() === '') {
      errors.push({ field: 'externalDbHost', message: 'External database host is required' });
    }
    if (!config.externalDbPort || isNaN(parseInt(config.externalDbPort))) {
      errors.push({ field: 'externalDbPort', message: 'External database port must be a valid number' });
    }
    if (!config.postgresDatabase || config.postgresDatabase.trim() === '') {
      errors.push({ field: 'postgresDatabase', message: 'Database name is required' });
    }
    if (!config.postgresUser || config.postgresUser.trim() === '') {
      errors.push({ field: 'postgresUser', message: 'Database user is required' });
    }
    if (!config.postgresPassword || config.postgresPassword.trim() === '') {
      errors.push({ field: 'postgresPassword', message: 'Database password is required' });
    }
  }

  // Validate license key
  if (config.licenseKeyType === 'custom') {
    if (!config.licenseKey || config.licenseKey.trim() === '') {
      errors.push({ field: 'licenseKey', message: 'Custom license key is required' });
    }
  }

  // Validate Anthropic API configuration
  if (!config.anthropicAuthToken || config.anthropicAuthToken.trim() === '') {
    errors.push({ field: 'anthropicAuthToken', message: 'API token is required' });
  }

  if (config.anthropicApiProvider === 'custom') {
    if (!config.anthropicUrl || config.anthropicUrl.trim() === '') {
      errors.push({ field: 'anthropicUrl', message: 'API endpoint URL is required for custom provider' });
    }
  }

  // Validate work directory
  if (!config.workdirPath || config.workdirPath.trim() === '') {
    errors.push({ field: 'workdirPath', message: 'Work directory path is required' });
  }

  // Validate PUID and PGID for Linux
  if (config.hostOS === 'linux' && !config.workdirCreatedByRoot) {
    if (!config.puid || config.puid.trim() === '' || isNaN(parseInt(config.puid))) {
      errors.push({ field: 'puid', message: 'PUID must be a valid number' });
    }
    if (!config.pgid || config.pgid.trim() === '' || isNaN(parseInt(config.pgid))) {
      errors.push({ field: 'pgid', message: 'PGID must be a valid number' });
    }
  }

  return errors;
}

/**
 * Check if configuration is valid
 * @param config The configuration to validate
 * @returns true if valid, false otherwise
 */
export function isValidConfig(config: DockerComposeConfig): boolean {
  return validateConfig(config).length === 0;
}
