import { describe, expect, it } from 'vitest';

import { getServiceTemplates } from '../../serviceTemplates';

describe('serviceTemplates', () => {
  it('registers only the retained standard template', () => {
    const templates = getServiceTemplates();

    expect(templates).toEqual([
      {
        id: 'standard',
        labelKey: 'configForm.standardTemplate',
        descriptionKey: 'configForm.standardTemplateDescription',
        requiredEnv: []
      }
    ]);
  });
});
