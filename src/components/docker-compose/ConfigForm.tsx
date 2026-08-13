import { useSelector, useDispatch } from 'react-redux';
import {
  selectConfig,
  setConfigField,
  selectProviders,
  selectProvidersLoading,
  selectProvidersError,
  selectProviderById,
} from '@/lib/docker-compose/slice';
import type { DockerComposeConfig, ConfigProfile, ExecutorType, ImageRegistry } from '@/lib/docker-compose/types';
import type { RootState } from '@/lib/store';
import { localizeProviderPreset } from '@/lib/docker-compose/providerConfigLoader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HttpsConfigPanel } from '@/components/docker-compose/HttpsConfigPanel';
import { ConfigSectionCard } from '@/components/docker-compose/layout/ConfigSectionCard';
import type { WorkspaceSection, WorkspaceSectionId } from '@/components/docker-compose/layout/workspaceSections';
import { Settings2, Loader2, AlertCircle, FolderOpenDot, Sparkles, ExternalLink } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAVIGATION_LINKS } from '@/config/navigationLinks';
import { type ReactNode, useCallback, useEffect, useMemo } from 'react';
import { validateConfig } from '@/lib/docker-compose/validation';
import { Button } from '@/components/ui/button';
import { getDocsEulaUrl } from '@/lib/links';
import { cn } from '@/lib/utils';

interface ConfigFormProps {
  sections: WorkspaceSection[];
  onSelectSection: (sectionId: WorkspaceSectionId) => void;
}

const subSectionClass = 'scroll-mt-28 space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4 outline-none';

export function ConfigForm({ sections, onSelectSection }: ConfigFormProps) {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const config = useSelector(selectConfig);
  const providers = useSelector(selectProviders);
  const providersLoading = useSelector(selectProvidersLoading);
  const providersError = useSelector(selectProvidersError);

  const updateConfig = useCallback(<K extends keyof DockerComposeConfig>(field: K, value: DockerComposeConfig[K]) => {
    dispatch(setConfigField({ field, value }));
  }, [dispatch]);

  const currentProvider = useSelector((state: RootState) =>
    selectProviderById(state, config.anthropicApiProvider)
  );
  const localizedProviders = useMemo(
    () => providers.map((provider) => localizeProviderPreset(provider, i18n.resolvedLanguage)),
    [i18n.resolvedLanguage, providers],
  );
  const localizedCurrentProvider = useMemo(
    () => currentProvider ? localizeProviderPreset(currentProvider, i18n.resolvedLanguage) : undefined,
    [currentProvider, i18n.resolvedLanguage],
  );

  useEffect(() => {
    if (!providersLoading && providers.length > 0 && (!config.anthropicApiProvider || config.anthropicApiProvider === 'zai')) {
      const recommendedProvider = providers.find((provider) => provider.recommended && provider.providerId !== 'custom') || providers[0];
      if (recommendedProvider && recommendedProvider.providerId !== 'zai') {
        updateConfig('anthropicApiProvider', recommendedProvider.providerId);
      }
    }
  }, [providersLoading, providers, config.anthropicApiProvider, updateConfig]);

  const validationErrors = useMemo(
    () => validateConfig(config, i18n.resolvedLanguage ?? i18n.language),
    [config, i18n.language, i18n.resolvedLanguage],
  );
  const validationMap = useMemo(() => {
    const entries = validationErrors.map((error) => [error.field, error.message] as const);
    return Object.fromEntries(entries);
  }, [validationErrors]);

  const enabledExecutors = config.enabledExecutors;
  const claudeEnabled = enabledExecutors.includes('claude');
  const codexEnabled = enabledExecutors.includes('codex');
  const openCodeEnabled = enabledExecutors.includes('opencode');

  const setEnabledExecutors = useCallback((nextEnabled: ExecutorType[]) => {
    const uniqueEnabled = Array.from(new Set(nextEnabled));
    if (uniqueEnabled.length === 0) {
      return;
    }

    updateConfig('enabledExecutors', uniqueEnabled);
  }, [updateConfig]);

  const toggleExecutor = useCallback((executor: ExecutorType, enabled: boolean) => {
    if (enabled) {
      setEnabledExecutors([...enabledExecutors, executor]);
      return;
    }

    setEnabledExecutors(enabledExecutors.filter((item) => item !== executor));
  }, [enabledExecutors, setEnabledExecutors, updateConfig]);

  const sectionMap = useMemo(() => new Map(sections.map((section) => [section.id, section])), [sections]);
  const eulaDocsUrl = useMemo(
    () => getDocsEulaUrl(i18n.resolvedLanguage),
    [i18n.resolvedLanguage]
  );
  const renderFieldError = useCallback((field: string) => {
    const message = validationMap[field];
    if (!message) {
      return null;
    }

    return <p className="text-sm text-destructive">{message}</p>;
  }, [validationMap]);

  const getSection = useCallback((sectionId: WorkspaceSectionId) => sectionMap.get(sectionId), [sectionMap]);

  return (
    <div className="space-y-6 lg:space-y-8">
      {getSection('profile') ? (
        <ConfigSectionCard section={getSection('profile')!}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Settings2 className="size-4" />
              <span>{t('docker-compose:configForm.profileHelp')}</span>
            </div>
            <RadioGroup
              value={config.profile}
              onValueChange={(value: ConfigProfile) => updateConfig('profile', value)}
              className="grid grid-cols-1 gap-4 lg:grid-cols-2"
            >
              <Label
                htmlFor="quick-start"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/90 p-4 transition-all hover:border-primary/40 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/6"
              >
                <RadioGroupItem value="quick-start" id="quick-start" className="mt-1" />
                <div className="space-y-1">
                  <div className="flex items-center gap-2 font-medium">
                    <span>{t('docker-compose:configForm.quickStart')}</span>
                    <Badge variant="secondary">{t('common:common.default')}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.quickStartDescription')}</p>
                </div>
              </Label>
              <Label
                htmlFor="full-custom"
                className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/90 p-4 transition-all hover:border-primary/40 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/6"
              >
                <RadioGroupItem value="full-custom" id="full-custom" className="mt-1" />
                <div className="space-y-1">
                  <div className="font-medium">{t('docker-compose:configForm.fullCustom')}</div>
                  <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.fullCustomDescription')}</p>
                </div>
              </Label>
            </RadioGroup>
          </div>
        </ConfigSectionCard>
      ) : null}

      {getSection('base') ? (
        <ConfigSectionCard section={getSection('base')!}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="httpPort">
                {t('docker-compose:configForm.httpPort')} <span className="text-destructive">*</span>
              </Label>
              <Input
                id="httpPort"
                type="number"
                value={config.httpPort}
                onChange={(event) => updateConfig('httpPort', event.target.value)}
                placeholder="45000"
              />
              {renderFieldError('httpPort')}
            </div>

            {config.profile === 'full-custom' ? (
              <div className="space-y-2">
                <Label htmlFor="containerName">{t('docker-compose:configForm.containerName')}</Label>
                <Input
                  id="containerName"
                  value={config.containerName}
                  onChange={(event) => updateConfig('containerName', event.target.value)}
                  placeholder="hagicode-app"
                />
                {renderFieldError('containerName')}
              </div>
            ) : null}

            {config.profile === 'full-custom' ? (
              <div className="space-y-2">
                <Label htmlFor="imageTag">{t('docker-compose:configForm.imageTag')}</Label>
                <Input
                  id="imageTag"
                  value={config.imageTag}
                  onChange={(event) => updateConfig('imageTag', event.target.value)}
                  placeholder="0"
                />
                {renderFieldError('imageTag')}
              </div>
            ) : null}

            {config.profile === 'full-custom' ? (
              <div className="space-y-2">
                <Label htmlFor="hostOS">{t('docker-compose:configForm.hostOS')}</Label>
                <Select
                  value={config.hostOS}
                  onValueChange={(value: 'windows' | 'linux') => updateConfig('hostOS', value)}
                >
                  <SelectTrigger id="hostOS">
                    <SelectValue placeholder={t('docker-compose:configForm.selectHostOS')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="windows">{t('docker-compose:configForm.windows')}</SelectItem>
                    <SelectItem value="linux">{t('docker-compose:configForm.linux')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="space-y-2 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Label htmlFor="imageRegistry">
                  {t('docker-compose:configForm.imageRegistry')} <span className="text-destructive">*</span>
                </Label>
                <div className="text-sm text-muted-foreground">
                  {t('docker-compose:configForm.supportHint', {
                    groupNumber: NAVIGATION_LINKS.qqGroup.groupNumber,
                  })}
                </div>
              </div>
              <Select
                value={config.imageRegistry}
                onValueChange={(value: ImageRegistry) => updateConfig('imageRegistry', value)}
              >
                <SelectTrigger id="imageRegistry">
                  <SelectValue placeholder={t('docker-compose:configForm.selectImageRegistry')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="docker-hub">{t('docker-compose:configForm.dockerHub')}</SelectItem>
                </SelectContent>
              </Select>

              {config.imageRegistry === 'docker-hub' ? (
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-950 dark:bg-blue-950/30">
                  <p className="font-medium">{t('docker-compose:configForm.dockerOfficialRegistry')}</p>
                  <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.dockerHubNetworkAdvice')}</p>
                </div>
              ) : null}

            </div>
          </div>
        </ConfigSectionCard>
      ) : null}

      {getSection('executors') ? (
        <ConfigSectionCard section={getSection('executors')!}>
          <div className="space-y-4">
            <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
              <Label className="text-base font-semibold">
                {t('docker-compose:configForm.enabledExecutors')} <span className="text-destructive">*</span>
              </Label>
              <p className="mt-2 text-sm text-muted-foreground">{t('docker-compose:configForm.parallelEnablementHint')}</p>
              <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.explicitExecutorHint')}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <ExecutorToggle
                  id="executor-claude"
                  label="Claude"
                  checked={claudeEnabled}
                  disabled={enabledExecutors.length === 1 && claudeEnabled}
                  onCheckedChange={(checked) => toggleExecutor('claude', checked)}
                />
                <ExecutorToggle
                  id="executor-codex"
                  label="Codex"
                  checked={codexEnabled}
                  disabled={enabledExecutors.length === 1 && codexEnabled}
                  onCheckedChange={(checked) => toggleExecutor('codex', checked)}
                />
                <ExecutorToggle
                  id="executor-opencode"
                  label="OpenCode"
                  checked={openCodeEnabled}
                  disabled={enabledExecutors.length === 1 && openCodeEnabled}
                  onCheckedChange={(checked) => toggleExecutor('opencode', checked)}
                />
              </div>
              {renderFieldError('enabledExecutors')}
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-950 dark:bg-amber-950/25">
              <p className="font-medium">{t('docker-compose:configForm.communitySupportTitle')}</p>
              <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.communitySupportDescription')}</p>
              <p className="mt-3 text-muted-foreground">{t('docker-compose:configForm.communityContributeBuilder')}</p>
              <p className="text-muted-foreground">{t('docker-compose:configForm.communityContributeRelease')}</p>
            </div>

            <div id="executor-eula" tabIndex={-1} className={subSectionClass}>
              <div>
                <h4 className="text-base font-semibold">{t('docker-compose:configForm.eulaConfiguration')}</h4>
                <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.eulaDescription')}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="acceptEula"
                    checked={config.acceptEula}
                    onCheckedChange={(checked) => updateConfig('acceptEula', checked === true)}
                  />
                  <div className="space-y-2">
                    <Label htmlFor="acceptEula" className="cursor-pointer text-sm font-medium">
                      {t('docker-compose:configForm.acceptEula')}
                    </Label>
                    <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.acceptEulaHint')}</p>
                    <div className="flex flex-wrap items-center gap-3">
                      <a
                        href={eulaDocsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm font-medium text-primary transition-opacity hover:opacity-80"
                      >
                        <ExternalLink className="size-4" />
                        <span>{t('docker-compose:configForm.readEula')}</span>
                      </a>
                      <span className="text-xs text-muted-foreground">{t('docker-compose:configForm.acceptEulaSharedStateHint')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {claudeEnabled ? (
              <div id="executor-claude" tabIndex={-1} className={subSectionClass}>
                <div>
                  <h4 className="text-base font-semibold">{t('docker-compose:configForm.claudeConfiguration')}</h4>
                  <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.unifiedUseOfToken')}</p>
                </div>

                {providersLoading ? (
                  <div className="flex items-center gap-2 rounded-xl bg-background/80 p-3 text-sm text-muted-foreground">
                    <Loader2 className="size-4 animate-spin" />
                    <span>{t('common:workspace.providersLoading')}</span>
                  </div>
                ) : null}

                {providersError ? (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <span>{t('common:workspace.providersError', { message: providersError })}</span>
                  </div>
                ) : null}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="apiProvider">
                      {t('docker-compose:configForm.apiProvider')} <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={config.anthropicApiProvider}
                      onValueChange={(value: string) => {
                        updateConfig('anthropicApiProvider', value);
                        const provider = providers.find((item) => item.providerId === value);
                        if (provider && provider.providerId !== 'custom') {
                          updateConfig('anthropicSonnetModel', provider.defaultModels.sonnet || undefined);
                          updateConfig('anthropicOpusModel', provider.defaultModels.opus || undefined);
                          updateConfig('anthropicHaikuModel', provider.defaultModels.haiku || undefined);
                        } else {
                          updateConfig('anthropicSonnetModel', undefined);
                          updateConfig('anthropicOpusModel', undefined);
                          updateConfig('anthropicHaikuModel', undefined);
                        }
                      }}
                      disabled={providersLoading || providers.length === 0}
                    >
                      <SelectTrigger id="apiProvider">
                        <SelectValue placeholder={t('docker-compose:configForm.selectApiProvider')} />
                      </SelectTrigger>
                      <SelectContent>
                        {localizedProviders.map((provider) => (
                          <SelectItem key={provider.providerId} value={provider.providerId}>
                            <div className="flex items-center gap-2">
                              <span>{provider.name}</span>
                              {provider.recommended ? <Badge variant="secondary">{t('common:common.recommended')}</Badge> : null}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {currentProvider && currentProvider.referralUrl && currentProvider.providerId !== 'custom' ? (
                      <a
                        href={currentProvider.referralUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                      >
                        <Sparkles className="size-4" />
                        <span>{t('docker-compose:configForm.getApiToken')}</span>
                      </a>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    {config.anthropicApiProvider === 'custom' ? (
                      <>
                        <Label htmlFor="anthropicUrl">
                          {t('docker-compose:configForm.apiEndpointUrl')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="anthropicUrl"
                          value={config.anthropicUrl}
                          onChange={(event) => updateConfig('anthropicUrl', event.target.value)}
                          placeholder="https://api.example.com/v1"
                        />
                        {renderFieldError('anthropicUrl')}
                      </>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="anthropicAuthToken">
                    {t('docker-compose:configForm.apiToken')} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="anthropicAuthToken"
                    type="text"
                    value={config.anthropicAuthToken}
                    onChange={(event) => updateConfig('anthropicAuthToken', event.target.value)}
                    placeholder={
                      currentProvider?.providerId === 'anthropic'
                        ? t('docker-compose:configForm.enterAnthropicApiToken')
                        : t('docker-compose:configForm.enterApiToken')
                    }
                  />
                  {renderFieldError('anthropicAuthToken')}

                  {currentProvider && localizedCurrentProvider && config.anthropicApiProvider !== 'custom' ? (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-950 dark:bg-blue-950/30">
                      {currentProvider.providerId === 'anthropic' ? (
                        <p>{t('docker-compose:configForm.usingOfficialApi')}</p>
                      ) : (
                        <>
                          <p>{t('docker-compose:configForm.apiEndpointAutoSet')}: {currentProvider.apiUrl.codingPlanForAnthropic}</p>
                          {localizedCurrentProvider.description ? (
                            <p className="mt-1 text-xs text-muted-foreground">{localizedCurrentProvider.description}</p>
                          ) : null}
                          {localizedCurrentProvider.notes ? (
                            <p className="mt-1 text-xs text-muted-foreground">{localizedCurrentProvider.notes}</p>
                          ) : null}
                          {localizedCurrentProvider.networkAdvice ? (
                            <p className="mt-1 text-xs text-muted-foreground">{localizedCurrentProvider.networkAdvice}</p>
                          ) : null}
                        </>
                      )}
                    </div>
                  ) : null}

                  {config.anthropicApiProvider === 'custom' ? (
                    <div className="rounded-2xl border border-border/60 bg-background/80 p-4 text-sm">
                      <p>{t('docker-compose:configForm.usingCustomEndpoint')}</p>
                    </div>
                  ) : null}
                </div>

                {config.profile === 'full-custom' ? (
                  <div className="space-y-4 rounded-2xl border border-border/60 bg-background/80 p-4">
                    <div>
                      <h5 className="text-sm font-semibold">{t('docker-compose:configForm.claudeCodeExtendedConfig')}</h5>
                      <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.claudeCodeExtendedConfigDescription')}</p>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <FieldBlock label={t('docker-compose:configForm.anthropicSonnetModel')} htmlFor="anthropicSonnetModel">
                        <Input
                          id="anthropicSonnetModel"
                          type="text"
                          value={config.anthropicSonnetModel || ''}
                          onChange={(event) => updateConfig('anthropicSonnetModel', event.target.value || undefined)}
                          placeholder="claude-sonnet-4-20250514"
                        />
                        <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.anthropicSonnetModelHint')}</p>
                      </FieldBlock>

                      <FieldBlock label={t('docker-compose:configForm.anthropicOpusModel')} htmlFor="anthropicOpusModel">
                        <Input
                          id="anthropicOpusModel"
                          type="text"
                          value={config.anthropicOpusModel || ''}
                          onChange={(event) => updateConfig('anthropicOpusModel', event.target.value || undefined)}
                          placeholder="claude-opus-4-20250514"
                        />
                        <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.anthropicOpusModelHint')}</p>
                      </FieldBlock>

                      <FieldBlock label={t('docker-compose:configForm.anthropicHaikuModel')} htmlFor="anthropicHaikuModel">
                        <Input
                          id="anthropicHaikuModel"
                          type="text"
                          value={config.anthropicHaikuModel || ''}
                          onChange={(event) => updateConfig('anthropicHaikuModel', event.target.value || undefined)}
                          placeholder="claude-haiku-4-20250514"
                        />
                        <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.anthropicHaikuModelHint')}</p>
                      </FieldBlock>
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                      <Checkbox
                        id="claudeCodeExperimentalAgentTeams"
                        checked={config.claudeCodeExperimentalAgentTeams || false}
                        onCheckedChange={(checked) => updateConfig('claudeCodeExperimentalAgentTeams', checked as boolean)}
                      />
                      <div>
                        <Label htmlFor="claudeCodeExperimentalAgentTeams" className="cursor-pointer">
                          {t('docker-compose:configForm.claudeCodeExperimentalAgentTeams')}
                        </Label>
                        <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.claudeCodeExperimentalAgentTeamsHint')}</p>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {codexEnabled ? (
              <div id="executor-codex" tabIndex={-1} className={subSectionClass}>
                <div>
                  <h4 className="text-base font-semibold">{t('docker-compose:configForm.codexConfiguration')}</h4>
                  <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.codexDescription')}</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="codexApiKey">CODEX_API_KEY <span className="text-destructive">*</span></Label>
                    <Input
                      id="codexApiKey"
                      type="text"
                      value={config.codexApiKey}
                      onChange={(event) => updateConfig('codexApiKey', event.target.value)}
                      placeholder="Enter your CODEX_API_KEY"
                    />
                    {renderFieldError('codexApiKey')}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codexBaseUrl">CODEX_BASE_URL ({t('docker-compose:configForm.optional')})</Label>
                    <Input
                      id="codexBaseUrl"
                      type="text"
                      value={config.codexBaseUrl || ''}
                      onChange={(event) => updateConfig('codexBaseUrl', event.target.value || undefined)}
                      placeholder="https://api.example.com/v1"
                    />
                  </div>

                  <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-950 dark:bg-blue-950/30">
                    <p className="font-medium">{t('docker-compose:configForm.compatibilityAliasHint')}</p>
                    <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.codexCompatibilityDescription')}</p>
                    <p className="mt-2 text-xs font-mono">
                      OPENAI_API_KEY = CODEX_API_KEY
                      <br />
                      OPENAI_BASE_URL = CODEX_BASE_URL
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {openCodeEnabled ? (
              <div id="executor-opencode" tabIndex={-1} className={subSectionClass}>
                <div>
                  <h4 className="text-base font-semibold">{t('docker-compose:configForm.openCodeConfiguration')}</h4>
                  <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.openCodeDescription')}</p>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openCodeModel">{t('docker-compose:configForm.openCodeModel')}</Label>
                    <Input
                      id="openCodeModel"
                      type="text"
                      value={config.openCodeModel || ''}
                      onChange={(event) => updateConfig('openCodeModel', event.target.value || undefined)}
                      placeholder="anthropic/claude-sonnet-4"
                    />
                    <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.openCodeModelHint')}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <Label>{t('docker-compose:configForm.openCodeConfigSource')}</Label>
                      <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.openCodeConfigSourceHint')}</p>
                    </div>
                    <RadioGroup
                      value={config.openCodeConfigMode}
                      onValueChange={(value: DockerComposeConfig['openCodeConfigMode']) => updateConfig('openCodeConfigMode', value)}
                      className="grid grid-cols-1 gap-3"
                    >
                      <Label
                        htmlFor="openCodeConfigMode-default-managed"
                        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/90 p-4 transition-all hover:border-primary/40 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/6"
                      >
                        <RadioGroupItem value="default-managed" id="openCodeConfigMode-default-managed" className="mt-1" />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 font-medium">
                            <span>{t('docker-compose:configForm.openCodeConfigModeDefault')}</span>
                            <Badge variant="secondary">{t('common:common.recommended')}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.openCodeConfigModeDefaultHint')}</p>
                        </div>
                      </Label>
                      <Label
                        htmlFor="openCodeConfigMode-host-file"
                        className="flex cursor-pointer items-start gap-3 rounded-2xl border border-border/70 bg-background/90 p-4 transition-all hover:border-primary/40 hover:bg-primary/5 has-[:checked]:border-primary has-[:checked]:bg-primary/6"
                      >
                        <RadioGroupItem value="host-file" id="openCodeConfigMode-host-file" className="mt-1" />
                        <div className="space-y-1">
                          <div className="font-medium">{t('docker-compose:configForm.openCodeConfigModeHostFile')}</div>
                          <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.openCodeConfigModeHostFileHint')}</p>
                        </div>
                      </Label>
                    </RadioGroup>
                  </div>

                  {config.openCodeConfigMode === 'host-file' ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="openCodeConfigHostPath">
                          {t('docker-compose:configForm.openCodeConfigHostPath')} <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="openCodeConfigHostPath"
                          type="text"
                          value={config.openCodeConfigHostPath}
                          onChange={(event) => updateConfig('openCodeConfigHostPath', event.target.value)}
                          placeholder={config.hostOS === 'windows'
                            ? 'C:\\opencode\\opencode.json'
                            : '/srv/opencode/opencode.json'}
                        />
                        {renderFieldError('openCodeConfigHostPath')}
                        <p className="text-sm text-muted-foreground">
                          {t('docker-compose:configForm.openCodeConfigHostPathHint', {
                            example: config.hostOS === 'windows'
                              ? 'C:\\opencode\\opencode.json'
                              : '/srv/opencode/opencode.json'
                          })}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="openCodeAuthHostPath" className="flex items-center gap-2">
                          <span>{t('docker-compose:configForm.openCodeAuthHostPath')}</span>
                          <Badge variant="outline">{t('docker-compose:configForm.optional')}</Badge>
                        </Label>
                        <Input
                          id="openCodeAuthHostPath"
                          type="text"
                          value={config.openCodeAuthHostPath}
                          onChange={(event) => updateConfig('openCodeAuthHostPath', event.target.value)}
                          placeholder={config.hostOS === 'windows'
                            ? 'C:\\opencode\\auth.json'
                            : '/srv/opencode/auth.json'}
                        />
                        {renderFieldError('openCodeAuthHostPath')}
                        <p className="text-sm text-muted-foreground">
                          {t('docker-compose:configForm.openCodeAuthHostPathHint', {
                            example: config.hostOS === 'windows'
                              ? 'C:\\opencode\\auth.json'
                              : '/srv/opencode/auth.json'
                          })}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="openCodeModelsHostPath" className="flex items-center gap-2">
                          <span>{t('docker-compose:configForm.openCodeModelsHostPath')}</span>
                          <Badge variant="outline">{t('docker-compose:configForm.optional')}</Badge>
                        </Label>
                        <Input
                          id="openCodeModelsHostPath"
                          type="text"
                          value={config.openCodeModelsHostPath}
                          onChange={(event) => updateConfig('openCodeModelsHostPath', event.target.value)}
                          placeholder={config.hostOS === 'windows'
                            ? 'C:\\opencode\\models.json'
                            : '/srv/opencode/models.json'}
                        />
                        {renderFieldError('openCodeModelsHostPath')}
                        <p className="text-sm text-muted-foreground">
                          {t('docker-compose:configForm.openCodeModelsHostPathHint', {
                            example: config.hostOS === 'windows'
                              ? 'C:\\opencode\\models.json'
                              : '/srv/opencode/models.json'
                          })}
                        </p>
                      </div>

                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-950 dark:bg-amber-950/25">
                        <p className="font-medium">{t('docker-compose:configForm.openCodeConfigBrowserLimitTitle')}</p>
                        <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.openCodeConfigBrowserLimitHint')}</p>
                        <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.openCodeConfigManualPriorityHint')}</p>
                        <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.openCodeAdditionalHostFilesHint')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-950 dark:bg-blue-950/30">
                      <p className="font-medium">{t('docker-compose:configForm.openCodeManagedVolumeTitle')}</p>
                      <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.openCodeManagedVolumeHint')}</p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-950 dark:bg-amber-950/25">
                    <p className="font-medium">{t('docker-compose:configForm.openCodeConfigAuthWarningTitle')}</p>
                    <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.openCodeConfigAuthWarningHint')}</p>
                    <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.openCodeConfigAuthMigrationHint')}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {config.profile === 'full-custom' ? (
              <div id="executor-code-server" tabIndex={-1} className={subSectionClass}>
                <div>
                  <h4 className="text-base font-semibold">{t('docker-compose:configForm.codeServerConfiguration')}</h4>
                  <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.codeServerDescription')}</p>
                </div>

                <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="enableCodeServer"
                      checked={config.enableCodeServer}
                      onCheckedChange={(checked) => updateConfig('enableCodeServer', checked === true)}
                    />
                    <div className="space-y-1">
                      <Label htmlFor="enableCodeServer" className="cursor-pointer text-sm font-medium">
                        {t('docker-compose:configForm.codeServerEnable')}
                      </Label>
                      <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.codeServerEnableHint')}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-950 dark:bg-blue-950/30">
                  <p className="font-medium">{t('docker-compose:configForm.codeServerPrivateTitle')}</p>
                  <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.codeServerPrivateHint')}</p>
                </div>

                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm dark:border-emerald-950 dark:bg-emerald-950/25">
                  <p className="font-medium">{t('docker-compose:configForm.codeServerPersistenceTitle')}</p>
                  <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.codeServerPersistenceHint')}</p>
                  <p className="mt-2 text-xs font-mono">{t('docker-compose:configForm.codeServerPersistencePathValue')}</p>
                  <p className="mt-2 text-xs font-mono">{t('docker-compose:configForm.codeServerSaveStatePathValue')}</p>
                </div>

                {config.enableCodeServer ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FieldBlock label={t('docker-compose:configForm.codeServerHost')} htmlFor="codeServerHost">
                        <Input
                          id="codeServerHost"
                          type="text"
                          value={config.codeServerHost}
                          onChange={(event) => updateConfig('codeServerHost', event.target.value)}
                          placeholder="127.0.0.1"
                        />
                        {renderFieldError('codeServerHost')}
                        <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.codeServerHostHint')}</p>
                      </FieldBlock>

                      <FieldBlock label={t('docker-compose:configForm.codeServerPort')} htmlFor="codeServerPort">
                        <Input
                          id="codeServerPort"
                          type="number"
                          value={config.codeServerPort}
                          onChange={(event) => updateConfig('codeServerPort', event.target.value)}
                          placeholder="36529"
                        />
                        {renderFieldError('codeServerPort')}
                        <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.codeServerPortHint')}</p>
                      </FieldBlock>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FieldBlock label={t('docker-compose:configForm.codeServerAuthMode')} htmlFor="codeServerAuthMode">
                        <Select
                          value={config.codeServerAuthMode}
                          onValueChange={(value: DockerComposeConfig['codeServerAuthMode']) => updateConfig('codeServerAuthMode', value)}
                        >
                          <SelectTrigger id="codeServerAuthMode">
                            <SelectValue placeholder={t('docker-compose:configForm.codeServerAuthMode')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">{t('docker-compose:configForm.codeServerAuthModeNone')}</SelectItem>
                            <SelectItem value="password">{t('docker-compose:configForm.codeServerAuthModePassword')}</SelectItem>
                          </SelectContent>
                        </Select>
                        {renderFieldError('codeServerAuthMode')}
                        <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.codeServerAuthModeHint')}</p>
                      </FieldBlock>

                      {config.codeServerAuthMode === 'password' ? (
                        <FieldBlock label={t('docker-compose:configForm.codeServerPassword')} htmlFor="codeServerPassword">
                          <Input
                            id="codeServerPassword"
                            type="password"
                            value={config.codeServerPassword}
                            onChange={(event) => updateConfig('codeServerPassword', event.target.value)}
                            placeholder="change-me"
                          />
                          {renderFieldError('codeServerPassword')}
                          <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.codeServerPasswordHint')}</p>
                        </FieldBlock>
                      ) : (
                        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                          <p className="font-medium">{t('docker-compose:configForm.codeServerAuthModeNone')}</p>
                          <p className="mt-1">{t('docker-compose:configForm.codeServerPasswordSkippedHint')}</p>
                        </div>
                      )}
                    </div>

                    <div className="space-y-4 rounded-2xl border border-border/60 bg-background/80 p-4">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id="codeServerPublishToHost"
                          checked={config.codeServerPublishToHost}
                          onCheckedChange={(checked) => updateConfig('codeServerPublishToHost', checked === true)}
                        />
                        <div className="space-y-1">
                          <Label htmlFor="codeServerPublishToHost" className="cursor-pointer text-sm font-medium">
                            {t('docker-compose:configForm.codeServerPublishToHost')}
                          </Label>
                          <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.codeServerPublishToHostHint')}</p>
                        </div>
                      </div>

                      {config.codeServerPublishToHost ? (
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <FieldBlock label={t('docker-compose:configForm.codeServerPublishedPort')} htmlFor="codeServerPublishedPort">
                            <Input
                              id="codeServerPublishedPort"
                              type="number"
                              value={config.codeServerPublishedPort}
                              onChange={(event) => updateConfig('codeServerPublishedPort', event.target.value)}
                              placeholder="36529"
                            />
                            {renderFieldError('codeServerPublishedPort')}
                            <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.codeServerPublishedPortHint')}</p>
                          </FieldBlock>

                          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-950 dark:bg-blue-950/30">
                            <p className="font-medium">{t('docker-compose:configForm.codeServerPublishBindTitle')}</p>
                            <p className="mt-1 text-muted-foreground">{t('docker-compose:configForm.codeServerPublishBindHint')}</p>
                            <p className="mt-2 text-xs font-mono">{t('docker-compose:configForm.codeServerPublishBindValue')}</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 bg-muted/15 p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">{t('docker-compose:configForm.codeServerDisabledTitle')}</p>
                    <p className="mt-1">{t('docker-compose:configForm.codeServerDisabledHint')}</p>
                  </div>
                )}
              </div>
            ) : null}

          </div>
        </ConfigSectionCard>
      ) : null}

      {getSection('https') ? (
        <ConfigSectionCard
          section={getSection('https')!}
          action={
            getSection('https')!.errorCount > 0 ? (
              <Button type="button" variant="outline" size="sm" onClick={() => onSelectSection('https')}>
                {t('common:workspace.resolveSection')}
              </Button>
            ) : null
          }
        >
          <HttpsConfigPanel
            config={config}
            updateConfig={updateConfig}
            validationErrors={validationMap}
          />
        </ConfigSectionCard>
      ) : null}

      {getSection('advanced') ? (
        <ConfigSectionCard section={getSection('advanced')!}>
          <div className="space-y-6">
            <div className={subSectionClass}>
              <div>
                <h4 className="text-base font-semibold">{t('docker-compose:configForm.volumeMounts')}</h4>
                <p className="text-sm text-muted-foreground">{t('docker-compose:configForm.workdirDescription')}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workdirPath">
                  {t('docker-compose:configForm.workdirPath')} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="workdirPath"
                  value={config.workdirPath}
                  onChange={(event) => updateConfig('workdirPath', event.target.value)}
                  placeholder={config.hostOS === 'windows' ? 'C:\\repos' : '/home/user/repos'}
                />
                {renderFieldError('workdirPath')}
                <p className="text-xs text-muted-foreground">{t('docker-compose:configForm.workdirRecommendation')}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
                <div className="flex items-center gap-3">
                  <FolderOpenDot className="size-4 text-primary" />
                  <span className="text-sm font-medium">{t('common:workspace.repositoryHint')}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{t('common:workspace.repositoryHintDescription')}</p>
              </div>

              {config.hostOS === 'linux' && config.profile === 'full-custom' ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 p-4">
                    <Checkbox
                      id="workdirCreatedByRoot"
                      checked={config.workdirCreatedByRoot}
                      onCheckedChange={(checked) => updateConfig('workdirCreatedByRoot', checked as boolean)}
                    />
                    <Label htmlFor="workdirCreatedByRoot" className="cursor-pointer">
                      {t('docker-compose:configForm.workdirCreatedByRoot')}
                    </Label>
                  </div>

                  {config.workdirCreatedByRoot ? (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm dark:border-red-950 dark:bg-red-950/25">
                      <p className="font-medium text-red-800 dark:text-red-200">{t('docker-compose:configForm.permissionIssueWarning')}</p>
                      <p className="mt-2 text-red-700 dark:text-red-300">{t('docker-compose:configForm.permissionIssueDescription')}</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5 text-red-700 dark:text-red-300">
                        <li>
                          {t('docker-compose:configForm.changeDirPermissions')}{' '}
                          <code className="rounded bg-red-100 px-1 dark:bg-red-900">chmod 777 /path/to/repos</code>
                        </li>
                        <li>{t('docker-compose:configForm.createNonRootUser')}</li>
                      </ul>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm dark:border-blue-950 dark:bg-blue-950/30">
                      <p className="font-medium">{t('docker-compose:configForm.configureUserPermission')}</p>
                      <p className="mt-2 text-muted-foreground">{t('docker-compose:configForm.configureUserPermissionDescription')}</p>
                      <p className="mt-2 text-muted-foreground">
                        {t('docker-compose:configForm.getCurrentUserId')}{' '}
                        <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">id username</code>
                        <br />
                        {t('docker-compose:configForm.outputExample')}{' '}
                        <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">uid=1000(user) gid=1000(user)</code>
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <FieldBlock label={`${t('docker-compose:configForm.puid')} *`} htmlFor="puid">
                          <Input
                            id="puid"
                            value={config.puid}
                            onChange={(event) => updateConfig('puid', event.target.value)}
                            placeholder="1000"
                          />
                          {renderFieldError('puid')}
                        </FieldBlock>
                        <FieldBlock label={`${t('docker-compose:configForm.pgid')} *`} htmlFor="pgid">
                          <Input
                            id="pgid"
                            value={config.pgid}
                            onChange={(event) => updateConfig('pgid', event.target.value)}
                            placeholder="1000"
                          />
                          {renderFieldError('pgid')}
                        </FieldBlock>
                      </div>
                    </div>
                  )}

                  {config.workdirCreatedByRoot ? (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-950 dark:bg-amber-950/25">
                      <p className="font-medium text-amber-800 dark:text-amber-200">{t('docker-compose:configForm.permissionNotRequired')}</p>
                      <p className="mt-2 text-amber-700 dark:text-amber-300">{t('docker-compose:configForm.permissionNotRequiredDescription')}</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {config.profile === 'full-custom' ? (
              <div className={subSectionClass}>
                <div>
                  <h4 className="text-base font-semibold">{t('docker-compose:configForm.licenseConfig')}</h4>
                  <p className="text-sm text-muted-foreground">{t('common:workspace.licenseDescription')}</p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <FieldBlock label={t('docker-compose:configForm.licenseKeyType')} htmlFor="licenseKeyType">
                    <Select
                      value={config.licenseKeyType}
                      onValueChange={(value: 'public' | 'custom') => updateConfig('licenseKeyType', value)}
                    >
                      <SelectTrigger id="licenseKeyType">
                        <SelectValue placeholder={t('docker-compose:configForm.selectLicenseType')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">{t('docker-compose:configForm.publicTestKey')}</SelectItem>
                        <SelectItem value="custom">{t('docker-compose:configForm.customKey')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </FieldBlock>

                  {config.licenseKeyType === 'custom' ? (
                    <FieldBlock label={t('docker-compose:configForm.customLicenseKey')} htmlFor="licenseKey">
                      <Input
                        id="licenseKey"
                        value={config.licenseKey}
                        onChange={(event) => updateConfig('licenseKey', event.target.value)}
                        placeholder="Enter your license key"
                      />
                      {renderFieldError('licenseKey')}
                    </FieldBlock>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>
        </ConfigSectionCard>
      ) : null}
    </div>
  );
}

interface ExecutorToggleProps {
  id: string;
  label: string;
  checked: boolean;
  disabled: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ExecutorToggle({ id, label, checked, disabled, onCheckedChange }: ExecutorToggleProps) {
  return (
    <Label
      htmlFor={id}
      className={cn(
        'flex items-center gap-3 rounded-2xl border border-border/60 bg-background/80 p-3 transition-colors',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:bg-accent/40',
        checked && 'border-primary/40 bg-primary/5'
      )}
    >
      <Checkbox
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(checkedValue) => onCheckedChange(checkedValue === true)}
      />
      <span>{label}</span>
    </Label>
  );
}

interface FieldBlockProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
}

function FieldBlock({ label, htmlFor, children }: FieldBlockProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
