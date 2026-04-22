import type { DockerComposeConfig } from './types';
import { hasPortConflict, parseHostWithOptionalPort } from '../../validators/ipValidator';

const WINDOWS_FILE_PATH_PATTERN = /^[A-Za-z]:[\\/].+$/;
const CODE_SERVER_PUBLIC_LISTEN_HOSTS = new Set(['0.0.0.0', '::']);

function parseRequiredPort(value: string): number | null {
  if (!value || Number.isNaN(parseInt(value, 10))) {
    return null;
  }

  return parseInt(value, 10);
}

function getOpenCodeHostPathError(
  pathValue: string,
  config: DockerComposeConfig,
  label: string,
  required: boolean,
  exampleFilename: string
): string | null {
  const path = pathValue.trim();

  if (path.length === 0) {
    return required ? `${label} is required when host-file mode is enabled` : null;
  }

  if (path.endsWith('/') || path.endsWith('\\')) {
    return `${label} must point to a .json file, not a directory`;
  }

  if (!path.toLowerCase().endsWith('.json')) {
    return `${label} must end with .json`;
  }

  if (config.hostOS === 'windows') {
    return WINDOWS_FILE_PATH_PATTERN.test(path)
      ? null
      : `${label} must be an absolute Windows path such as C:\\opencode\\${exampleFilename}`;
  }

  return path.startsWith('/')
    ? null
    : `${label} must be an absolute Linux path such as /srv/opencode/${exampleFilename}`;
}

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
  const claudeEnabled = config.enabledExecutors.includes('claude');
  const codexEnabled = config.enabledExecutors.includes('codex');
  const openCodeEnabled = config.enabledExecutors.includes('opencode');

  // Validate executor capability only.
  if (!Array.isArray(config.enabledExecutors) || config.enabledExecutors.length === 0) {
    errors.push({ field: 'enabledExecutors', message: 'At least one executor must be enabled' });
  }

  // Validate HTTP port
  if (!config.httpPort || isNaN(parseInt(config.httpPort))) {
    errors.push({ field: 'httpPort', message: 'HTTP port must be a valid number' });
  } else if (parseInt(config.httpPort) < 1 || parseInt(config.httpPort) > 65535) {
    errors.push({ field: 'httpPort', message: 'HTTP port must be between 1 and 65535' });
  }

  // Validate HTTPS configuration
  if (config.enableHttps) {
    if (!config.httpsPort || Number.isNaN(parseInt(config.httpsPort))) {
      errors.push({ field: 'httpsPort', message: 'HTTPS port must be a valid number' });
    } else if (parseInt(config.httpsPort) < 1 || parseInt(config.httpsPort) > 65535) {
      errors.push({ field: 'httpsPort', message: 'HTTPS port must be between 1 and 65535' });
    }

    const parsedLanIp = parseHostWithOptionalPort(config.lanIp || '');
    if (!parsedLanIp) {
      errors.push({ field: 'lanIp', message: 'LAN IP must be a valid IPv4/IPv6 address' });
    }

    if (hasPortConflict(config.httpPort, config.httpsPort)) {
      errors.push({ field: 'httpsPort', message: 'HTTPS port cannot be the same as HTTP port' });
    }
  }

  // Validate container name
  if (!config.containerName || config.containerName.trim() === '') {
    errors.push({ field: 'containerName', message: 'Container name is required' });
  }

  // Validate image tag
  if (!config.imageTag || config.imageTag.trim() === '') {
    errors.push({ field: 'imageTag', message: 'Image tag is required' });
  }

  // Validate license key
  if (config.licenseKeyType === 'custom') {
    if (!config.licenseKey || config.licenseKey.trim() === '') {
      errors.push({ field: 'licenseKey', message: 'Custom license key is required' });
    }
  }

  // Validate Claude configuration when Claude capability is enabled
  if (claudeEnabled) {
    if (!config.anthropicAuthToken || config.anthropicAuthToken.trim() === '') {
      errors.push({ field: 'anthropicAuthToken', message: 'API token is required when Claude executor is enabled' });
    }

    if (config.anthropicApiProvider === 'custom') {
      if (!config.anthropicUrl || config.anthropicUrl.trim() === '') {
        errors.push({ field: 'anthropicUrl', message: 'API endpoint URL is required for custom Claude provider' });
      }
    }
  }

  // Validate Codex configuration when Codex capability is enabled
  if (codexEnabled) {
    if (!config.codexApiKey || config.codexApiKey.trim() === '') {
      errors.push({ field: 'codexApiKey', message: 'CODEX_API_KEY is required when Codex executor is enabled' });
    }
  }

  if (openCodeEnabled && config.openCodeConfigMode === 'host-file') {
    const openCodeConfigHostPathError = getOpenCodeHostPathError(
      config.openCodeConfigHostPath,
      config,
      'OpenCode config host file path',
      true,
      'opencode.json'
    );
    if (openCodeConfigHostPathError) {
      errors.push({
        field: 'openCodeConfigHostPath',
        message: openCodeConfigHostPathError
      });
    }

    const openCodeAuthHostPathError = getOpenCodeHostPathError(
      config.openCodeAuthHostPath,
      config,
      'OpenCode auth host file path',
      false,
      'auth.json'
    );
    if (openCodeAuthHostPathError) {
      errors.push({
        field: 'openCodeAuthHostPath',
        message: openCodeAuthHostPathError
      });
    }

    const openCodeModelsHostPathError = getOpenCodeHostPathError(
      config.openCodeModelsHostPath,
      config,
      'OpenCode models host file path',
      false,
      'models.json'
    );
    if (openCodeModelsHostPathError) {
      errors.push({
        field: 'openCodeModelsHostPath',
        message: openCodeModelsHostPathError
      });
    }
  }

  if (config.profile === 'full-custom' && config.enableCodeServer) {
    const parsedCodeServerHost = parseHostWithOptionalPort(config.codeServerHost || '');
    if (!parsedCodeServerHost) {
      errors.push({ field: 'codeServerHost', message: 'Code Server listen host must be a valid IPv4/IPv6 address' });
    } else if (parsedCodeServerHost.port !== undefined) {
      errors.push({ field: 'codeServerHost', message: 'Code Server listen host must not include a port' });
    }

    const codeServerPort = parseRequiredPort(config.codeServerPort);
    if (codeServerPort === null) {
      errors.push({ field: 'codeServerPort', message: 'Code Server container port must be a valid number' });
    } else if (codeServerPort < 1 || codeServerPort > 65535) {
      errors.push({ field: 'codeServerPort', message: 'Code Server container port must be between 1 and 65535' });
    } else if (codeServerPort === 45000) {
      errors.push({ field: 'codeServerPort', message: 'Code Server container port cannot reuse the HagiCode app port 45000' });
    }

    if (config.codeServerAuthMode !== 'none' && config.codeServerAuthMode !== 'password') {
      errors.push({ field: 'codeServerAuthMode', message: 'Code Server auth mode must be none or password' });
    }

    if (config.codeServerAuthMode === 'password' && (!config.codeServerPassword || config.codeServerPassword.trim() === '')) {
      errors.push({ field: 'codeServerPassword', message: 'Code Server password is required when auth mode is password' });
    }

    if (config.codeServerPublishToHost) {
      const publishedPort = parseRequiredPort(config.codeServerPublishedPort);
      if (publishedPort === null) {
        errors.push({ field: 'codeServerPublishedPort', message: 'Code Server published port must be a valid number' });
      } else if (publishedPort < 1 || publishedPort > 65535) {
        errors.push({ field: 'codeServerPublishedPort', message: 'Code Server published port must be between 1 and 65535' });
      } else {
        if (!config.enableHttps && hasPortConflict(config.httpPort, config.codeServerPublishedPort)) {
          errors.push({ field: 'codeServerPublishedPort', message: 'Code Server published port cannot match the HagiCode HTTP port' });
        }

        if (config.enableHttps && hasPortConflict(config.httpsPort, config.codeServerPublishedPort)) {
          errors.push({ field: 'codeServerPublishedPort', message: 'Code Server published port cannot match the HTTPS proxy port' });
        }
      }

      if (parsedCodeServerHost && !CODE_SERVER_PUBLIC_LISTEN_HOSTS.has(parsedCodeServerHost.host.trim())) {
        errors.push({
          field: 'codeServerHost',
          message: 'Code Server listen host must be 0.0.0.0 or :: when host publishing is enabled'
        });
      }
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
