import { describe, expect, it } from 'vitest';

import enUS from '@/i18n/locales/en-US.json';
import zhCN from '@/i18n/locales/zh-CN.json';
import {
  OPENCODE_AUTH_TARGET_FILE,
  OPENCODE_CONFIG_TARGET_FILE,
  OPENCODE_MODELS_TARGET_FILE,
  OPENCODE_RUNTIME_HOME,
} from '../../types';

describe('OpenCode guidance copy', () => {
  it('keeps the zh-CN guidance aligned with the hagicode container paths', () => {
    expect(zhCN.configForm.openCodeManagedVolumeHint).toContain(OPENCODE_RUNTIME_HOME);
    expect(zhCN.configForm.openCodeConfigAuthWarningHint).toContain('opencode.json');
    expect(zhCN.configForm.openCodeConfigAuthWarningHint).toContain('auth.json');
    expect(zhCN.configForm.openCodeConfigAuthWarningHint).toContain('models.json');
    expect(zhCN.configForm.openCodeConfigAuthMigrationHint).toContain(OPENCODE_AUTH_TARGET_FILE);
    expect(zhCN.configForm.openCodeAdditionalHostFilesHint).toContain('models.json');
  });

  it('keeps the en-US guidance aligned with the hagicode container paths', () => {
    expect(enUS.configForm.openCodeManagedVolumeHint).toContain(OPENCODE_RUNTIME_HOME);
    expect(enUS.configForm.openCodeConfigAuthWarningHint).toContain('opencode.json');
    expect(enUS.configForm.openCodeConfigAuthWarningHint).toContain('auth.json');
    expect(enUS.configForm.openCodeConfigAuthWarningHint).toContain('models.json');
    expect(enUS.configForm.openCodeConfigAuthMigrationHint).toContain(OPENCODE_AUTH_TARGET_FILE);
    expect(enUS.configForm.openCodeAdditionalHostFilesHint).toContain('models.json');
  });

  it('documents all three OpenCode file targets used in the UI help copy', () => {
    expect(OPENCODE_CONFIG_TARGET_FILE).toBe('/home/hagicode/.config/opencode/opencode.json');
    expect(OPENCODE_AUTH_TARGET_FILE).toBe('/home/hagicode/.local/share/opencode/auth.json');
    expect(OPENCODE_MODELS_TARGET_FILE).toBe('/home/hagicode/.cache/opencode/models.json');
  });
});
