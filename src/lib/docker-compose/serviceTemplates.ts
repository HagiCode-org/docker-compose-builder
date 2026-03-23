export type ServiceTemplateId = 'standard';

export interface ServiceTemplateDefinition {
  id: ServiceTemplateId;
  labelKey: string;
  descriptionKey: string;
  requiredEnv: string[];
}

const SERVICE_TEMPLATES: ServiceTemplateDefinition[] = [
  {
    id: 'standard',
    labelKey: 'configForm.standardTemplate',
    descriptionKey: 'configForm.standardTemplateDescription',
    requiredEnv: []
  }
];

export function getServiceTemplates(): ServiceTemplateDefinition[] {
  return SERVICE_TEMPLATES;
}
