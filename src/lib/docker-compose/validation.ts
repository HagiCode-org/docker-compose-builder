import type { DockerComposeConfig } from './types';
import { hasPortConflict, parseHostWithOptionalPort } from '../../validators/ipValidator';
import { DEFAULT_BUILDER_LANGUAGE } from '@/i18n/config';
import { getBuilderMessage } from '@/i18n/resources';

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
  fieldKey: 'openCodeConfigHostPath' | 'openCodeAuthHostPath' | 'openCodeModelsHostPath',
  required: boolean,
  exampleFilename: string,
  language: string | null | undefined,
): string | null {
  const path = pathValue.trim();
  const label = getValidationMessage(language, `docker-compose:validation.fields.${fieldKey}`);

  if (path.length === 0) {
    return required
      ? getValidationMessage(language, 'docker-compose:validation.messages.hostFileRequired', { label })
      : null;
  }

  if (path.endsWith('/') || path.endsWith('\\')) {
    return getValidationMessage(language, 'docker-compose:validation.messages.hostFileMustBeJsonFile', { label });
  }

  if (!path.toLowerCase().endsWith('.json')) {
    return getValidationMessage(language, 'docker-compose:validation.messages.hostFileMustEndWithJson', { label });
  }

  if (config.hostOS === 'windows') {
    return WINDOWS_FILE_PATH_PATTERN.test(path)
      ? null
      : getValidationMessage(language, 'docker-compose:validation.messages.hostFileMustBeAbsoluteWindows', {
        label,
        exampleFilename,
      });
  }

  return path.startsWith('/')
    ? null
    : getValidationMessage(language, 'docker-compose:validation.messages.hostFileMustBeAbsoluteLinux', {
      label,
      exampleFilename,
    });
}

function getValidationMessage(
  language: string | null | undefined,
  key: string,
  interpolation?: Record<string, string | number>,
): string {
  return getBuilderMessage(language ?? DEFAULT_BUILDER_LANGUAGE, key, interpolation);
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
export function validateConfig(
  config: DockerComposeConfig,
  language: string | null | undefined = DEFAULT_BUILDER_LANGUAGE,
): ValidationError[] {
  const errors: ValidationError[] = [];
  const claudeEnabled = config.enabledExecutors.includes('claude');
  const codexEnabled = config.enabledExecutors.includes('codex');
  const openCodeEnabled = config.enabledExecutors.includes('opencode');

  // Validate executor capability only.
  if (!Array.isArray(config.enabledExecutors) || config.enabledExecutors.length === 0) {
    errors.push({
      field: 'enabledExecutors',
      message: getValidationMessage(language, 'docker-compose:validation.messages.enabledExecutorsRequired'),
    });
  }

  const supportedRegistries: DockerComposeConfig['imageRegistry'][] = ['docker-hub', 'aliyun-acr'];
  // Validate image registry
  if (!supportedRegistries.includes(config.imageRegistry)) {
    errors.push({
      field: 'imageRegistry',
      message: getValidationMessage(language, 'docker-compose:validation.messages.imageRegistryLegacyRemoved'),
    });
  }
  // Validate HTTP port
  if (!config.httpPort || isNaN(parseInt(config.httpPort))) {
    errors.push({ field: 'httpPort', message: getValidationMessage(language, 'docker-compose:validation.messages.httpPortInvalid') });
  } else if (parseInt(config.httpPort) < 1 || parseInt(config.httpPort) > 65535) {
    errors.push({ field: 'httpPort', message: getValidationMessage(language, 'docker-compose:validation.messages.httpPortRange') });
  }

  // Validate HTTPS configuration
  if (config.enableHttps) {
    if (!config.httpsPort || Number.isNaN(parseInt(config.httpsPort))) {
      errors.push({ field: 'httpsPort', message: getValidationMessage(language, 'docker-compose:validation.messages.httpsPortInvalid') });
    } else if (parseInt(config.httpsPort) < 1 || parseInt(config.httpsPort) > 65535) {
      errors.push({ field: 'httpsPort', message: getValidationMessage(language, 'docker-compose:validation.messages.httpsPortRange') });
    }

    const parsedLanIp = parseHostWithOptionalPort(config.lanIp || '');
    if (!parsedLanIp) {
      errors.push({ field: 'lanIp', message: getValidationMessage(language, 'docker-compose:validation.messages.lanIpInvalid') });
    }

    if (hasPortConflict(config.httpPort, config.httpsPort)) {
      errors.push({ field: 'httpsPort', message: getValidationMessage(language, 'docker-compose:validation.messages.httpsPortConflict') });
    }
  }

  // Validate container name
  if (!config.containerName || config.containerName.trim() === '') {
    errors.push({ field: 'containerName', message: getValidationMessage(language, 'docker-compose:validation.messages.containerNameRequired') });
  }

  // Validate image tag
  if (!config.imageTag || config.imageTag.trim() === '') {
    errors.push({ field: 'imageTag', message: getValidationMessage(language, 'docker-compose:validation.messages.imageTagRequired') });
  }

  // Validate license key
  if (config.licenseKeyType === 'custom') {
    if (!config.licenseKey || config.licenseKey.trim() === '') {
      errors.push({ field: 'licenseKey', message: getValidationMessage(language, 'docker-compose:validation.messages.customLicenseKeyRequired') });
    }
  }

  // Validate Claude configuration when Claude capability is enabled
  if (claudeEnabled) {
    if (!config.anthropicAuthToken || config.anthropicAuthToken.trim() === '') {
      errors.push({ field: 'anthropicAuthToken', message: getValidationMessage(language, 'docker-compose:validation.messages.anthropicAuthTokenRequired') });
    }

    if (config.anthropicApiProvider === 'custom') {
      if (!config.anthropicUrl || config.anthropicUrl.trim() === '') {
        errors.push({ field: 'anthropicUrl', message: getValidationMessage(language, 'docker-compose:validation.messages.anthropicUrlRequired') });
      }
    }
  }

  // Validate Codex configuration when Codex capability is enabled
  if (codexEnabled) {
    if (!config.codexApiKey || config.codexApiKey.trim() === '') {
      errors.push({ field: 'codexApiKey', message: getValidationMessage(language, 'docker-compose:validation.messages.codexApiKeyRequired') });
    }
  }

  if (openCodeEnabled && config.openCodeConfigMode === 'host-file') {
    const openCodeConfigHostPathError = getOpenCodeHostPathError(
      config.openCodeConfigHostPath,
      config,
      'openCodeConfigHostPath',
      true,
      'opencode.json',
      language,
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
      'openCodeAuthHostPath',
      false,
      'auth.json',
      language,
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
      'openCodeModelsHostPath',
      false,
      'models.json',
      language,
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
      errors.push({ field: 'codeServerHost', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerHostInvalid') });
    } else if (parsedCodeServerHost.port !== undefined) {
      errors.push({ field: 'codeServerHost', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerHostNoPort') });
    }

    const codeServerPort = parseRequiredPort(config.codeServerPort);
    if (codeServerPort === null) {
      errors.push({ field: 'codeServerPort', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPortInvalid') });
    } else if (codeServerPort < 1 || codeServerPort > 65535) {
      errors.push({ field: 'codeServerPort', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPortRange') });
    } else if (codeServerPort === 45000) {
      errors.push({ field: 'codeServerPort', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPortConflict') });
    }

    if (config.codeServerAuthMode !== 'none' && config.codeServerAuthMode !== 'password') {
      errors.push({ field: 'codeServerAuthMode', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerAuthModeInvalid') });
    }

    if (config.codeServerAuthMode === 'password' && (!config.codeServerPassword || config.codeServerPassword.trim() === '')) {
      errors.push({ field: 'codeServerPassword', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPasswordRequired') });
    }

    if (config.codeServerPublishToHost) {
      const publishedPort = parseRequiredPort(config.codeServerPublishedPort);
      if (publishedPort === null) {
        errors.push({ field: 'codeServerPublishedPort', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPublishedPortInvalid') });
      } else if (publishedPort < 1 || publishedPort > 65535) {
        errors.push({ field: 'codeServerPublishedPort', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPublishedPortRange') });
      } else {
        if (!config.enableHttps && hasPortConflict(config.httpPort, config.codeServerPublishedPort)) {
          errors.push({ field: 'codeServerPublishedPort', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPublishedPortHttpConflict') });
        }

        if (config.enableHttps && hasPortConflict(config.httpsPort, config.codeServerPublishedPort)) {
          errors.push({ field: 'codeServerPublishedPort', message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerPublishedPortHttpsConflict') });
        }
      }

      if (parsedCodeServerHost && !CODE_SERVER_PUBLIC_LISTEN_HOSTS.has(parsedCodeServerHost.host.trim())) {
        errors.push({
          field: 'codeServerHost',
          message: getValidationMessage(language, 'docker-compose:validation.messages.codeServerHostPublishConflict'),
        });
      }
    }
  }

  // Validate work directory
  if (!config.workdirPath || config.workdirPath.trim() === '') {
    errors.push({ field: 'workdirPath', message: getValidationMessage(language, 'docker-compose:validation.messages.workdirPathRequired') });
  }

  // Validate PUID and PGID for Linux
  if (config.hostOS === 'linux' && !config.workdirCreatedByRoot) {
    if (!config.puid || config.puid.trim() === '' || isNaN(parseInt(config.puid))) {
      errors.push({ field: 'puid', message: getValidationMessage(language, 'docker-compose:validation.messages.puidInvalid') });
    }
    if (!config.pgid || config.pgid.trim() === '' || isNaN(parseInt(config.pgid))) {
      errors.push({ field: 'pgid', message: getValidationMessage(language, 'docker-compose:validation.messages.pgidInvalid') });
    }
  }

  return errors;
}

/**
 * Check if configuration is valid
 * @param config The configuration to validate
 * @returns true if valid, false otherwise
 */
export function isValidConfig(
  config: DockerComposeConfig,
  language: string | null | undefined = DEFAULT_BUILDER_LANGUAGE,
): boolean {
  return validateConfig(config, language).length === 0;
}
