import type { ValidationError } from '@/lib/docker-compose/validation';
import type { DockerComposeConfig } from '@/lib/docker-compose/types';

export type WorkspaceSectionId =
  | 'profile'
  | 'base'
  | 'executors'
  | 'https'
  | 'database'
  | 'advanced';

export type WorkspaceSectionChildId =
  | 'executor-eula'
  | 'executor-claude'
  | 'executor-codex'
  | 'executor-opencode'
  | 'executor-code-server';

export type WorkspaceSectionStatus = 'active' | 'complete' | 'error' | 'pending';

export interface WorkspaceSectionChild {
  id: WorkspaceSectionChildId;
  parentId: WorkspaceSectionId;
  titleKey: string;
  descriptionKey: string;
  fieldIds: string[];
  errorFields: ValidationError[];
  errorCount: number;
  isVisible: boolean;
  isComplete: boolean;
}

export interface WorkspaceSection {
  id: WorkspaceSectionId;
  titleKey: string;
  descriptionKey: string;
  shortTitleKey: string;
  fieldIds: string[];
  errorFields: ValidationError[];
  errorCount: number;
  isVisible: boolean;
  isComplete: boolean;
  isOptional: boolean;
  status: WorkspaceSectionStatus;
  children: WorkspaceSectionChild[];
}

interface WorkspaceSectionDefinition {
  id: WorkspaceSectionId;
  titleKey: string;
  descriptionKey: string;
  shortTitleKey: string;
  fieldIds: string[];
  isVisible: (config: DockerComposeConfig) => boolean;
  isOptional?: boolean;
  isComplete: (config: DockerComposeConfig) => boolean;
}

interface WorkspaceSectionChildDefinition {
  id: WorkspaceSectionChildId;
  parentId: WorkspaceSectionId;
  titleKey: string;
  descriptionKey: string;
  fieldIds: string[];
  isVisible: (config: DockerComposeConfig) => boolean;
  isComplete: (config: DockerComposeConfig) => boolean;
}

const hasTextValue = (value: string | undefined) => Boolean(value?.trim());

const sectionDefinitions: WorkspaceSectionDefinition[] = [
  {
    id: 'profile',
    titleKey: 'workspace.sections.profile.title',
    shortTitleKey: 'workspace.sections.profile.shortTitle',
    descriptionKey: 'workspace.sections.profile.description',
    fieldIds: ['profile'],
    isVisible: () => true,
    isComplete: (config) => Boolean(config.profile),
  },
  {
    id: 'base',
    titleKey: 'workspace.sections.base.title',
    shortTitleKey: 'workspace.sections.base.shortTitle',
    descriptionKey: 'workspace.sections.base.description',
    fieldIds: ['httpPort', 'containerName', 'imageTag', 'hostOS', 'imageRegistry'],
    isVisible: () => true,
    isComplete: (config) =>
      hasTextValue(config.httpPort)
      && hasTextValue(config.imageTag)
      && hasTextValue(config.containerName)
      && Boolean(config.hostOS)
      && Boolean(config.imageRegistry),
  },
  {
    id: 'executors',
    titleKey: 'workspace.sections.executors.title',
    shortTitleKey: 'workspace.sections.executors.shortTitle',
    descriptionKey: 'workspace.sections.executors.description',
    fieldIds: [
      'enabledExecutors',
      'anthropicApiProvider',
      'anthropicAuthToken',
      'anthropicUrl',
      'codexApiKey',
      'codexBaseUrl',
      'openCodeModel',
      'openCodeConfigMode',
      'openCodeConfigHostPath',
      'acceptEula',
      'enableCodeServer',
      'codeServerHost',
      'codeServerPort',
      'codeServerPublishToHost',
      'codeServerPublishedPort',
      'codeServerAuthMode',
      'codeServerPassword',
    ],
    isVisible: () => true,
    isComplete: (config) => {
      if (config.enabledExecutors.length === 0) {
        return false;
      }

      const claudeReady = !config.enabledExecutors.includes('claude')
        || (hasTextValue(config.anthropicAuthToken)
          && (config.anthropicApiProvider !== 'custom' || hasTextValue(config.anthropicUrl)));
      const codexReady = !config.enabledExecutors.includes('codex') || hasTextValue(config.codexApiKey);
      const openCodeReady = !config.enabledExecutors.includes('opencode')
        || config.openCodeConfigMode === 'default-managed'
        || hasTextValue(config.openCodeConfigHostPath);
      const codeServerReady = config.profile !== 'full-custom'
        || !config.enableCodeServer
        || (
          hasTextValue(config.codeServerHost)
          && hasTextValue(config.codeServerPort)
          && (!config.codeServerPublishToHost || hasTextValue(config.codeServerPublishedPort))
          && (config.codeServerAuthMode !== 'password' || hasTextValue(config.codeServerPassword))
        );

      return claudeReady
        && codexReady
        && openCodeReady
        && codeServerReady;
    },
  },
  {
    id: 'https',
    titleKey: 'workspace.sections.https.title',
    shortTitleKey: 'workspace.sections.https.shortTitle',
    descriptionKey: 'workspace.sections.https.description',
    fieldIds: ['enableHttps', 'httpsPort', 'lanIp'],
    isVisible: (config) => config.profile === 'full-custom',
    isOptional: true,
    isComplete: (config) =>
      config.enableHttps ? hasTextValue(config.httpsPort) && hasTextValue(config.lanIp) : false,
  },
  {
    id: 'database',
    titleKey: 'workspace.sections.database.title',
    shortTitleKey: 'workspace.sections.database.shortTitle',
    descriptionKey: 'workspace.sections.database.description',
    fieldIds: [
      'databaseType',
      'postgresDatabase',
      'postgresUser',
      'postgresPassword',
      'externalDbHost',
      'externalDbPort',
      'volumeType',
      'volumeName',
      'volumePath',
    ],
    isVisible: (config) => config.profile === 'full-custom',
    isComplete: (config) => {
      if (config.databaseType === 'sqlite') {
        return true;
      }

      if (config.databaseType === 'internal') {
        return hasTextValue(config.postgresDatabase)
          && hasTextValue(config.postgresUser)
          && hasTextValue(config.postgresPassword)
          && (
            (config.volumeType === 'named' && hasTextValue(config.volumeName))
            || (config.volumeType === 'bind' && hasTextValue(config.volumePath))
          );
      }

      return hasTextValue(config.externalDbHost)
        && hasTextValue(config.externalDbPort)
        && hasTextValue(config.postgresDatabase)
        && hasTextValue(config.postgresUser)
        && hasTextValue(config.postgresPassword);
    },
  },
  {
    id: 'advanced',
    titleKey: 'workspace.sections.advanced.title',
    shortTitleKey: 'workspace.sections.advanced.shortTitle',
    descriptionKey: 'workspace.sections.advanced.description',
    fieldIds: [
      'workdirPath',
      'workdirCreatedByRoot',
      'puid',
      'pgid',
      'licenseKeyType',
      'licenseKey',
      'anthropicSonnetModel',
      'anthropicOpusModel',
      'anthropicHaikuModel',
      'claudeCodeExperimentalAgentTeams',
    ],
    isVisible: () => true,
    isComplete: (config) =>
      hasTextValue(config.workdirPath)
      && (config.hostOS !== 'linux'
        || config.workdirCreatedByRoot
        || (hasTextValue(config.puid) && hasTextValue(config.pgid)))
      && (config.licenseKeyType !== 'custom' || hasTextValue(config.licenseKey)),
  },
];

const childDefinitions: WorkspaceSectionChildDefinition[] = [
  {
    id: 'executor-eula',
    parentId: 'executors',
    titleKey: 'workspace.executorItems.eula.title',
    descriptionKey: 'workspace.executorItems.eula.description',
    fieldIds: ['acceptEula'],
    isVisible: () => true,
    isComplete: (config) => typeof config.acceptEula === 'boolean',
  },
  {
    id: 'executor-claude',
    parentId: 'executors',
    titleKey: 'workspace.executorItems.claude.title',
    descriptionKey: 'workspace.executorItems.claude.description',
    fieldIds: ['anthropicApiProvider', 'anthropicAuthToken', 'anthropicUrl'],
    isVisible: (config) => config.enabledExecutors.includes('claude'),
    isComplete: (config) =>
      hasTextValue(config.anthropicAuthToken)
      && (config.anthropicApiProvider !== 'custom' || hasTextValue(config.anthropicUrl)),
  },
  {
    id: 'executor-codex',
    parentId: 'executors',
    titleKey: 'workspace.executorItems.codex.title',
    descriptionKey: 'workspace.executorItems.codex.description',
    fieldIds: ['codexApiKey', 'codexBaseUrl'],
    isVisible: (config) => config.enabledExecutors.includes('codex'),
    isComplete: (config) => hasTextValue(config.codexApiKey),
  },
  {
    id: 'executor-opencode',
    parentId: 'executors',
    titleKey: 'workspace.executorItems.opencode.title',
    descriptionKey: 'workspace.executorItems.opencode.description',
    fieldIds: ['openCodeModel', 'openCodeConfigMode', 'openCodeConfigHostPath'],
    isVisible: (config) => config.enabledExecutors.includes('opencode'),
    isComplete: (config) =>
      config.openCodeConfigMode === 'default-managed' || hasTextValue(config.openCodeConfigHostPath),
  },
  {
    id: 'executor-code-server',
    parentId: 'executors',
    titleKey: 'workspace.executorItems.codeServer.title',
    descriptionKey: 'workspace.executorItems.codeServer.description',
    fieldIds: [
      'enableCodeServer',
      'codeServerHost',
      'codeServerPort',
      'codeServerPublishToHost',
      'codeServerPublishedPort',
      'codeServerAuthMode',
      'codeServerPassword',
    ],
    isVisible: (config) => config.profile === 'full-custom',
    isComplete: (config) =>
      !config.enableCodeServer
      || (
        hasTextValue(config.codeServerHost)
        && hasTextValue(config.codeServerPort)
        && (!config.codeServerPublishToHost || hasTextValue(config.codeServerPublishedPort))
        && (config.codeServerAuthMode !== 'password' || hasTextValue(config.codeServerPassword))
      ),
  },
];

export const getWorkspaceSections = (
  config: DockerComposeConfig,
  validationErrors: ValidationError[],
  activeSectionId?: WorkspaceSectionId
): WorkspaceSection[] => sectionDefinitions
  .map((definition) => {
    const isVisible = definition.isVisible(config);
    const errorFields = validationErrors.filter((error) => definition.fieldIds.includes(error.field));
    const isComplete = isVisible && errorFields.length === 0 && definition.isComplete(config);
    const children = childDefinitions
      .filter((childDefinition) => childDefinition.parentId === definition.id)
      .map((childDefinition) => {
        const childVisible = childDefinition.isVisible(config);
        const childErrors = validationErrors.filter((error) => childDefinition.fieldIds.includes(error.field));

        return {
          id: childDefinition.id,
          parentId: childDefinition.parentId,
          titleKey: childDefinition.titleKey,
          descriptionKey: childDefinition.descriptionKey,
          fieldIds: childDefinition.fieldIds,
          errorFields: childErrors,
          errorCount: childErrors.length,
          isVisible: childVisible,
          isComplete: childVisible && childErrors.length === 0 && childDefinition.isComplete(config),
        };
      })
      .filter((child) => child.isVisible);

    let status: WorkspaceSectionStatus = 'pending';
    if (definition.id === activeSectionId) {
      status = 'active';
    } else if (errorFields.length > 0) {
      status = 'error';
    } else if (isComplete) {
      status = 'complete';
    }

    return {
      id: definition.id,
      titleKey: definition.titleKey,
      shortTitleKey: definition.shortTitleKey,
      descriptionKey: definition.descriptionKey,
      fieldIds: definition.fieldIds,
      errorFields,
      errorCount: errorFields.length,
      isVisible,
      isComplete,
      isOptional: definition.isOptional ?? false,
      status,
      children,
    };
  })
  .filter((section) => section.isVisible);

export const findFirstErrorSection = (sections: WorkspaceSection[]): WorkspaceSection | undefined =>
  sections.find((section) => section.errorCount > 0);

export const getWorkspaceSummary = (sections: WorkspaceSection[]) => ({
  total: sections.length,
  completed: sections.filter((section) => section.isComplete).length,
  errored: sections.reduce((count, section) => count + section.errorCount, 0),
});

export const isWorkspaceExportReady = (sections: WorkspaceSection[]) =>
  sections.every((section) => section.errorCount === 0);
