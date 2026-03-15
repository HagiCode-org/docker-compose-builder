import type { DockerComposeConfig } from './types';
import type { CopilotReleaseMetadata } from './releaseIndexLoader';

export type ServiceTemplateId = 'standard' | 'copilot-cli';

export interface ServiceTemplateDefinition {
  id: ServiceTemplateId;
  labelKey: string;
  descriptionKey: string;
  requiredEnv: string[];
}

const COPILOT_IMAGE_TAG_REGEX = /^v?\d+\.\d+\.\d+([-.][0-9A-Za-z.-]+)?-copilot$/;

const SERVICE_TEMPLATES: ServiceTemplateDefinition[] = [
  {
    id: 'standard',
    labelKey: 'configForm.standardTemplate',
    descriptionKey: 'configForm.standardTemplateDescription',
    requiredEnv: []
  },
  {
    id: 'copilot-cli',
    labelKey: 'configForm.copilotTemplate',
    descriptionKey: 'configForm.copilotTemplateDescription',
    requiredEnv: ['COPILOT_API_KEY']
  }
];

export function getServiceTemplates(): ServiceTemplateDefinition[] {
  return SERVICE_TEMPLATES;
}

export function createCopilotTemplateDefaults(
  metadata: CopilotReleaseMetadata
): Partial<DockerComposeConfig> {
  return {
    enabledExecutors: ['copilot-cli'],
    imageTag: metadata.imageTag,
    copilotMountWorkspace: true
  };
}

export function validateCopilotImageTag(imageTag: string): boolean {
  return COPILOT_IMAGE_TAG_REGEX.test(imageTag.trim());
}
