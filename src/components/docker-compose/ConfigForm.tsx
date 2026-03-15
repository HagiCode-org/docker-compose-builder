import { useSelector, useDispatch } from 'react-redux';
import {
  selectConfig,
  setConfigField,
  selectProviders,
  selectProvidersLoading,
  selectProvidersError,
  selectProviderById,
  selectCopilotMetadata,
  selectCopilotMetadataLoading,
  selectCopilotMetadataError
} from '@/lib/docker-compose/slice';
import type { DockerComposeConfig, ConfigProfile, ExecutorType } from '@/lib/docker-compose/types';
import { REGISTRIES } from '@/lib/docker-compose/types';
import type { RootState } from '@/lib/store';
import { createCopilotTemplateDefaults } from '@/lib/docker-compose/serviceTemplates';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { HttpsConfigPanel } from '@/components/docker-compose/HttpsConfigPanel';
import { Settings, Loader2, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAVIGATION_LINKS } from '@/config/navigationLinks';
import { useCallback, useEffect, useMemo } from 'react';
import { validateConfig } from '@/lib/docker-compose/validation';

export function ConfigForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const config = useSelector(selectConfig);
  const providers = useSelector(selectProviders);
  const providersLoading = useSelector(selectProvidersLoading);
  const providersError = useSelector(selectProvidersError);
  const copilotMetadata = useSelector(selectCopilotMetadata);
  const copilotMetadataLoading = useSelector(selectCopilotMetadataLoading);
  const copilotMetadataError = useSelector(selectCopilotMetadataError);

  const updateConfig = useCallback(<K extends keyof DockerComposeConfig>(field: K, value: DockerComposeConfig[K]) => {
    dispatch(setConfigField({ field, value }));
  }, [dispatch]);

  // Get current provider from state
  const currentProvider = useSelector((state: RootState) =>
    selectProviderById(state, config.anthropicApiProvider)
  );

  // Initialize provider if not set and providers are loaded
  useEffect(() => {
    if (!providersLoading && providers.length > 0 && (!config.anthropicApiProvider || config.anthropicApiProvider === 'zai')) {
      const recommendedProvider = providers.find(p => p.recommended && p.providerId !== 'custom') || providers[0];
      if (recommendedProvider && recommendedProvider.providerId !== 'zai') {
        updateConfig('anthropicApiProvider', recommendedProvider.providerId);
      }
    }
  }, [providersLoading, providers, config.anthropicApiProvider, updateConfig]);

  const validationMap = useMemo(() => {
    const entries = validateConfig(config).map((error) => [error.field, error.message] as const);
    return Object.fromEntries(entries);
  }, [config]);

  const enabledExecutors = config.enabledExecutors;
  const claudeEnabled = enabledExecutors.includes('claude');
  const codexEnabled = enabledExecutors.includes('codex');
  const copilotEnabled = enabledExecutors.includes('copilot-cli');
  const codebuddyEnabled = enabledExecutors.includes('codebuddy-cli');
  const iflowEnabled = enabledExecutors.includes('iflow-cli');
  const openCodeEnabled = enabledExecutors.includes('opencode');

  useEffect(() => {
    if (!copilotEnabled || !copilotMetadata) {
      return;
    }

    if (!config.imageTag.endsWith('-copilot')) {
      const templateDefaults = createCopilotTemplateDefaults(copilotMetadata);
      if (templateDefaults.imageTag) {
        updateConfig('imageTag', templateDefaults.imageTag);
      }
    }
  }, [copilotEnabled, copilotMetadata, config.imageTag, updateConfig]);

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
      if (executor === 'copilot-cli' && copilotMetadata) {
        const templateDefaults = createCopilotTemplateDefaults(copilotMetadata);
        if (templateDefaults.imageTag) {
          updateConfig('imageTag', templateDefaults.imageTag);
        }
        updateConfig('copilotMountWorkspace', true);
      }
      return;
    }

    setEnabledExecutors(enabledExecutors.filter((item) => item !== executor));
  }, [copilotMetadata, enabledExecutors, setEnabledExecutors, updateConfig]);

  return (
    <div className="space-y-6 p-6 sm:p-8">
      {/* Header */}
      <div className="border-b pb-4">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <Settings className="w-4 h-4 text-primary" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{t('configForm.title')}</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          {t('configForm.subtitle')}
        </p>
      </div>

      {/* Profile Selector */}
      <div className="space-y-3">
        <div>
          <Label className="text-base font-semibold">{t('configForm.profileLabel')}</Label>
          <p className="text-sm text-muted-foreground mt-1">
            {t('configForm.profileHelp')}
          </p>
        </div>
        <RadioGroup
          value={config.profile}
          onValueChange={(value: ConfigProfile) => updateConfig('profile', value)}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Label
            htmlFor="quick-start"
            className="flex items-start space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-sm group"
          >
            <RadioGroupItem value="quick-start" id="quick-start" className="mt-1" />
            <div className="flex-1 pointer-events-none">
              <div className="font-medium flex items-center gap-2">
                {t('configForm.quickStart')}
                <Badge variant="secondary" className="text-xs">{t('common.default')}</Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('configForm.quickStartDescription')}
              </p>
            </div>
          </Label>
          <Label
            htmlFor="full-custom"
            className="flex items-start space-x-3 p-4 border-2 rounded-xl hover:border-primary/50 hover:bg-accent/50 transition-all duration-200 cursor-pointer has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:shadow-sm group"
          >
            <RadioGroupItem value="full-custom" id="full-custom" className="mt-1" />
            <div className="flex-1 pointer-events-none">
              <div className="font-medium">
                {t('configForm.fullCustom')}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {t('configForm.fullCustomDescription')}
              </p>
            </div>
          </Label>
        </RadioGroup>
      </div>

      {/* Basic Settings */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('configForm.basicConfig')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="httpPort">
              {t('configForm.httpPort')} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="httpPort"
              type="number"
              value={config.httpPort}
              onChange={(e) => updateConfig('httpPort', e.target.value)}
              placeholder="45000"
            />
          </div>

          {config.profile === 'full-custom' && (
            <div className="space-y-2">
              <Label htmlFor="containerName">{t('configForm.containerName')}</Label>
              <Input
                id="containerName"
                value={config.containerName}
                onChange={(e) => updateConfig('containerName', e.target.value)}
                placeholder="hagicode-app"
              />
            </div>
          )}

          {config.profile === 'full-custom' && (
            <div className="space-y-2">
              <Label htmlFor="imageTag">{t('configForm.imageTag')}</Label>
              <Input
                id="imageTag"
                value={config.imageTag}
                onChange={(e) => updateConfig('imageTag', e.target.value)}
                placeholder="0"
              />
            </div>
          )}

          {config.profile === 'full-custom' && (
            <div className="space-y-2">
              <Label htmlFor="hostOS">{t('configForm.hostOS')}</Label>
              <Select
                value={config.hostOS}
                onValueChange={(value: 'windows' | 'linux') => updateConfig('hostOS', value)}
              >
                <SelectTrigger id="hostOS">
                  <SelectValue placeholder={t('configForm.selectHostOS')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="windows">{t('configForm.windows')}</SelectItem>
                  <SelectItem value="linux">{t('configForm.linux')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="imageRegistry">
                {t('configForm.imageRegistry')} <span className="text-red-500">*</span>
              </Label>
              <div className="text-sm text-muted-foreground">
                {t('configForm.supportHint', {
                  groupNumber: NAVIGATION_LINKS.qqGroup.groupNumber,
                })}
              </div>
            </div>
            <Select
              value={config.imageRegistry}
              onValueChange={(value: 'docker-hub' | 'azure-acr' | 'aliyun-acr') => updateConfig('imageRegistry', value)}
            >
              <SelectTrigger id="imageRegistry">
                <SelectValue placeholder={t('configForm.selectImageRegistry')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aliyun-acr">
                  <div className="flex items-center gap-2">
                    <span>{t('configForm.aliyunAcr')}</span>
                    <Badge variant="secondary">{t('common.recommended')}</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="docker-hub">{t('configForm.dockerHub')}</SelectItem>
                <SelectItem value="azure-acr">{t('configForm.azureContainerRegistry')}</SelectItem>
              </SelectContent>
            </Select>

            {config.imageRegistry === 'docker-hub' && (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                <p className="font-medium">✓ {t('configForm.dockerOfficialRegistry')}</p>
                <p className="text-muted-foreground">{t('configForm.dockerHubNetworkAdvice')}</p>
              </div>
            )}

            {config.imageRegistry === 'azure-acr' && (
              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                <p className="font-medium">ℹ️ {t('configForm.alternativeRegistry')}</p>
                <p className="text-muted-foreground">{t('configForm.azureAcrDescription')}</p>
                <p className="text-muted-foreground">{t('configForm.azureAcrNetworkAdvice')}</p>
                <p className="text-xs font-mono mt-1">
                  {t('configForm.imageLabel')}: {REGISTRIES['azure-acr'].imagePrefix}:{config.imageTag}
                </p>
              </div>
            )}

            {config.imageRegistry === 'aliyun-acr' && (
              <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 rounded-md text-sm">
                <p className="font-medium">🚀 {t('configForm.aliyunAcrRecommended')}</p>
                <p className="text-muted-foreground">{t('configForm.aliyunAcrDescription')}</p>
                <p className="text-muted-foreground">{t('configForm.aliyunAcrNetworkAdvice')}</p>
                <p className="text-xs font-mono mt-1">
                  {t('configForm.imageLabel')}: {REGISTRIES['aliyun-acr'].imagePrefix}/hagicode:{config.imageTag}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {config.profile === 'full-custom' && (
        <HttpsConfigPanel
          config={config}
          updateConfig={updateConfig}
          validationErrors={validationMap}
        />
      )}

      {/* AI Provider Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('configForm.aiProviderConfig')}</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('configForm.enabledExecutors')} <span className="text-red-500">*</span></Label>
            <p className="text-sm text-muted-foreground">{t('configForm.parallelEnablementHint')}</p>
            <p className="text-sm text-muted-foreground">{t('configForm.explicitExecutorHint')}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <Label
                htmlFor="executor-claude"
                className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                  enabledExecutors.length === 1 && claudeEnabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-accent/40'
                }`}
              >
                <Checkbox
                  id="executor-claude"
                  checked={claudeEnabled}
                  disabled={enabledExecutors.length === 1 && claudeEnabled}
                  onCheckedChange={(checked) => toggleExecutor('claude', checked === true)}
                />
                <span>Claude</span>
              </Label>
              <Label
                htmlFor="executor-codex"
                className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                  enabledExecutors.length === 1 && codexEnabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-accent/40'
                }`}
              >
                <Checkbox
                  id="executor-codex"
                  checked={codexEnabled}
                  disabled={enabledExecutors.length === 1 && codexEnabled}
                  onCheckedChange={(checked) => toggleExecutor('codex', checked === true)}
                />
                <span>Codex</span>
              </Label>
              <Label
                htmlFor="executor-copilot"
                className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                  enabledExecutors.length === 1 && copilotEnabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-accent/40'
                }`}
              >
                <Checkbox
                  id="executor-copilot"
                  checked={copilotEnabled}
                  disabled={enabledExecutors.length === 1 && copilotEnabled}
                  onCheckedChange={(checked) => toggleExecutor('copilot-cli', checked === true)}
                />
                <span>Copilot CLI</span>
              </Label>
              <Label
                htmlFor="executor-codebuddy"
                className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                  enabledExecutors.length === 1 && codebuddyEnabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-accent/40'
                }`}
              >
                <Checkbox
                  id="executor-codebuddy"
                  checked={codebuddyEnabled}
                  disabled={enabledExecutors.length === 1 && codebuddyEnabled}
                  onCheckedChange={(checked) => toggleExecutor('codebuddy-cli', checked === true)}
                />
                <span>CodeBuddy</span>
              </Label>
              <Label
                htmlFor="executor-iflow"
                className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                  enabledExecutors.length === 1 && iflowEnabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-accent/40'
                }`}
              >
                <Checkbox
                  id="executor-iflow"
                  checked={iflowEnabled}
                  disabled={enabledExecutors.length === 1 && iflowEnabled}
                  onCheckedChange={(checked) => toggleExecutor('iflow-cli', checked === true)}
                />
                <span>IFlow CLI</span>
              </Label>
              <Label
                htmlFor="executor-opencode"
                className={`flex items-center gap-2 p-3 border rounded-md transition-colors ${
                  enabledExecutors.length === 1 && openCodeEnabled
                    ? 'cursor-not-allowed opacity-60'
                    : 'cursor-pointer hover:bg-accent/40'
                }`}
              >
                <Checkbox
                  id="executor-opencode"
                  checked={openCodeEnabled}
                  disabled={enabledExecutors.length === 1 && openCodeEnabled}
                  onCheckedChange={(checked) => toggleExecutor('opencode', checked === true)}
                />
                <span>OpenCode</span>
              </Label>
            </div>
            {validationMap.enabledExecutors && (
              <p className="text-sm text-red-500">{validationMap.enabledExecutors}</p>
            )}
          </div>

          {/* Claude Configuration Subform */}
          {claudeEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">{t('configForm.claudeConfiguration')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('configForm.unifiedUseOfToken')}
              </p>

              {/* Provider loading state */}
              {providersLoading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 bg-muted rounded-md">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading provider configurations...</span>
                </div>
              )}

              {/* Provider error state */}
              {providersError && (
                <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400 p-3 bg-red-50 dark:bg-red-950/20 rounded-md">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Failed to load provider configurations: {providersError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apiProvider">
                    {t('configForm.apiProvider')} <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={config.anthropicApiProvider}
                    onValueChange={(value: string) => {
                      updateConfig('anthropicApiProvider', value);
                      // Auto-set model defaults based on provider configuration
                      const provider = providers.find(p => p.providerId === value);
                      if (provider && provider.providerId !== 'custom') {
                        // Apply model defaults from provider configuration
                        if (provider.defaultModels.sonnet) {
                          updateConfig('anthropicSonnetModel', provider.defaultModels.sonnet || undefined);
                        }
                        if (provider.defaultModels.opus) {
                          updateConfig('anthropicOpusModel', provider.defaultModels.opus || undefined);
                        }
                        if (provider.defaultModels.haiku) {
                          updateConfig('anthropicHaikuModel', provider.defaultModels.haiku || undefined);
                        }
                      } else {
                        // Custom or no provider defaults - clear model defaults
                        updateConfig('anthropicSonnetModel', undefined);
                        updateConfig('anthropicOpusModel', undefined);
                        updateConfig('anthropicHaikuModel', undefined);
                      }
                    }}
                    disabled={providersLoading || providers.length === 0}
                  >
                    <SelectTrigger id="apiProvider">
                      <SelectValue placeholder={t('configForm.selectApiProvider')} />
                    </SelectTrigger>
                    <SelectContent>
                      {providers.map((provider) => (
                        <SelectItem key={provider.providerId} value={provider.providerId}>
                          <div className="flex items-center gap-2">
                            <span>{provider.name}</span>
                            {provider.recommended && (
                              <Badge variant="secondary">{t('common.recommended')}</Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Referral link for current provider */}
                  {currentProvider && currentProvider.referralUrl && currentProvider.providerId !== 'custom' && (
                    <a
                      href={currentProvider.referralUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 dark:from-purple-500 dark:to-blue-500 dark:hover:from-purple-600 dark:hover:to-blue-600 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all duration-200 group"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>{t('configForm.getApiToken')}</span>
                      <svg className="w-4 h-4 opacity-70 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>

                <div className="space-y-2">
                  {/* Custom API URL input - only show for custom provider */}
                  {config.anthropicApiProvider === 'custom' && (
                    <>
                      <Label htmlFor="anthropicUrl">{t('configForm.apiEndpointUrl')} <span className="text-red-500">*</span></Label>
                      <Input
                        id="anthropicUrl"
                        value={config.anthropicUrl}
                        onChange={(e) => updateConfig('anthropicUrl', e.target.value)}
                        placeholder="https://api.example.com/v1"
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="anthropicAuthToken">
                  {t('configForm.apiToken')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="anthropicAuthToken"
                  type="text"
                  value={config.anthropicAuthToken}
                  onChange={(e) => updateConfig('anthropicAuthToken', e.target.value)}
                  placeholder={
                    currentProvider?.providerId === 'anthropic'
                      ? t('configForm.enterAnthropicApiToken')
                      : t('configForm.enterApiToken')
                  }
                />

                {/* Provider-specific information */}
                {currentProvider && config.anthropicApiProvider !== 'custom' && (
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                    {currentProvider.providerId === 'anthropic' ? (
                      <p>{t('configForm.usingOfficialApi')}</p>
                    ) : (
                      <>
                        <p>{t('configForm.apiEndpointAutoSet')}: {currentProvider.apiUrl.codingPlanForAnthropic}</p>
                        {currentProvider.description && (
                          <p className="text-xs text-muted-foreground mt-1">{currentProvider.description}</p>
                        )}
                        {currentProvider.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{currentProvider.notes}</p>
                        )}
                      </>
                    )}
                  </div>
                )}

                {config.anthropicApiProvider === 'custom' && (
                  <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
                    <p>{t('configForm.usingCustomEndpoint')}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Codex Configuration Subform */}
          {codexEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">{t('configForm.codexConfiguration')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('configForm.codexDescription')}
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="codexApiKey">
                    CODEX_API_KEY <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="codexApiKey"
                    type="text"
                    value={config.codexApiKey}
                    onChange={(e) => updateConfig('codexApiKey', e.target.value)}
                    placeholder="Enter your CODEX_API_KEY"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codexBaseUrl">
                    CODEX_BASE_URL ({t('configForm.optional')})
                  </Label>
                  <Input
                    id="codexBaseUrl"
                    type="text"
                    value={config.codexBaseUrl || ''}
                    onChange={(e) => updateConfig('codexBaseUrl', e.target.value || undefined)}
                    placeholder="https://api.example.com/v1"
                  />
                </div>

                {/* Compatibility alias hint */}
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                  <p className="font-medium mb-1">{t('configForm.compatibilityAliasHint')}</p>
                  <p className="text-muted-foreground">
                    {t('configForm.codexCompatibilityDescription')}
                  </p>
                  <p className="text-xs font-mono mt-1">
                    OPENAI_API_KEY = CODEX_API_KEY<br />
                    OPENAI_BASE_URL = CODEX_BASE_URL
                  </p>
                </div>
              </div>
            </div>
          )}

          {codebuddyEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">{t('configForm.codebuddyConfiguration')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('configForm.codebuddyDescription')}
              </p>

              <div className="space-y-2">
                <Label htmlFor="codebuddyApiKey">
                  CODEBUDDY_API_KEY <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="codebuddyApiKey"
                  type="text"
                  value={config.codebuddyApiKey}
                  onChange={(e) => updateConfig('codebuddyApiKey', e.target.value)}
                  placeholder="cb-..."
                />
                {validationMap.codebuddyApiKey && (
                  <p className="text-sm text-red-500">{validationMap.codebuddyApiKey}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="codebuddyInternetEnvironment">
                  CODEBUDDY_INTERNET_ENVIRONMENT
                </Label>
                <Input
                  id="codebuddyInternetEnvironment"
                  type="text"
                  value={config.codebuddyInternetEnvironment}
                  onChange={(e) => updateConfig('codebuddyInternetEnvironment', e.target.value)}
                  placeholder="ioa"
                />
                <p className="text-sm text-muted-foreground">
                  {t('configForm.codebuddyInternetEnvironmentHint')}
                </p>
              </div>
            </div>
          )}

          {iflowEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">{t('configForm.iflowConfiguration')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('configForm.iflowDescription')}
              </p>
              <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                <p className="font-medium">{t('configForm.iflowRuntimeCommand')}</p>
                <p className="text-muted-foreground mt-1">
                  {t('configForm.iflowLoginHint')}
                </p>
              </div>
            </div>
          )}

          {openCodeEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">{t('configForm.openCodeConfiguration')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('configForm.openCodeDescription')}
              </p>

              <div className="space-y-2">
                <Label htmlFor="openCodeModel">
                  {t('configForm.openCodeModel')}
                </Label>
                <Input
                  id="openCodeModel"
                  type="text"
                  value={config.openCodeModel || ''}
                  onChange={(e) => updateConfig('openCodeModel', e.target.value || undefined)}
                  placeholder="anthropic/claude-sonnet-4"
                />
                <p className="text-sm text-muted-foreground">
                  {t('configForm.openCodeModelHint')}
                </p>
              </div>
            </div>
          )}

          {/* Copilot CLI Configuration Subform */}
          {copilotEnabled && (
            <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium text-sm">{t('configForm.copilotConfiguration')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('configForm.copilotDescription')}
              </p>

              {copilotMetadataLoading && (
                <div className="text-sm text-muted-foreground">
                  {t('configForm.loadingCopilotMetadata')}
                </div>
              )}

              {copilotMetadata && (
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
                  <p>{t('configForm.copilotMetadataHint', { version: copilotMetadata.envSchemaVersion })}</p>
                  <p className="text-xs font-mono mt-1">
                    imageTag: {copilotMetadata.imageTag}
                  </p>
                </div>
              )}

              {copilotMetadataError && (
                <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-md text-sm">
                  <p>{t('configForm.copilotMetadataFallback')}</p>
                  <p className="text-xs text-muted-foreground mt-1">{copilotMetadataError}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="copilotApiKey">
                  COPILOT_API_KEY <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="copilotApiKey"
                  type="text"
                  value={config.copilotApiKey}
                  onChange={(e) => updateConfig('copilotApiKey', e.target.value)}
                  placeholder="Enter your COPILOT_API_KEY"
                />
                {validationMap.copilotApiKey && (
                  <p className="text-sm text-red-500">{validationMap.copilotApiKey}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="copilotBaseUrl">
                  COPILOT_BASE_URL ({t('configForm.optional')})
                </Label>
                <Input
                  id="copilotBaseUrl"
                  type="text"
                  value={config.copilotBaseUrl || ''}
                  onChange={(e) => updateConfig('copilotBaseUrl', e.target.value || undefined)}
                  placeholder="https://api.githubcopilot.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copilotImageTag">
                  {t('configForm.imageTag')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="copilotImageTag"
                  value={config.imageTag}
                  onChange={(e) => updateConfig('imageTag', e.target.value)}
                  placeholder="1.2.3-copilot"
                />
                {validationMap.imageTag && (
                  <p className="text-sm text-red-500">{validationMap.imageTag}</p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="copilotMountWorkspace"
                  checked={config.copilotMountWorkspace}
                  onCheckedChange={(checked) => updateConfig('copilotMountWorkspace', checked === true)}
                />
                <Label htmlFor="copilotMountWorkspace" className="cursor-pointer">
                  {t('configForm.copilotMountWorkspace')}
                </Label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Database Configuration */}
      {config.profile === 'full-custom' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('configForm.databaseConfig')}</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="databaseType">{t('configForm.databaseType')}</Label>
              <Select
                value={config.databaseType}
                onValueChange={(value: 'sqlite' | 'internal' | 'external') => updateConfig('databaseType', value)}
              >
                <SelectTrigger id="databaseType">
                  <SelectValue placeholder={t('configForm.selectDatabaseType')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sqlite">SQLite</SelectItem>
                  <SelectItem value="internal">{t('configForm.internalPostgresql')}</SelectItem>
                  <SelectItem value="external">{t('configForm.externalDatabase')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {config.databaseType === 'sqlite' ? (
              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-md text-sm">
                <p className="font-medium text-green-800 dark:text-green-200">
                  🚀 {t('configForm.sqliteDatabase')}
                </p>
                <p className="text-green-700 dark:text-green-300 mt-2">
                  {t('configForm.sqliteDescription')}
                </p>
                <p className="text-green-700 dark:text-green-300 mt-1">
                  {t('configForm.sqliteDataLocation')}: <code className="bg-green-100 dark:bg-green-900 px-1 rounded">/app/data/hagicode.db</code>
                </p>
              </div>
            ) : config.databaseType === 'internal' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postgresDatabase">{t('configForm.databaseName')}</Label>
                <Input
                  id="postgresDatabase"
                  value={config.postgresDatabase}
                  onChange={(e) => updateConfig('postgresDatabase', e.target.value)}
                  placeholder="hagicode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postgresUser">{t('configForm.username')}</Label>
                <Input
                  id="postgresUser"
                  value={config.postgresUser}
                  onChange={(e) => updateConfig('postgresUser', e.target.value)}
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postgresPassword">{t('configForm.password')}</Label>
                <Input
                  id="postgresPassword"
                  type="text"
                  value={config.postgresPassword}
                  onChange={(e) => updateConfig('postgresPassword', e.target.value)}
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="volumeType">{t('configForm.volumeType')}</Label>
                <Select
                  value={config.volumeType}
                  onValueChange={(value: 'named' | 'bind') => updateConfig('volumeType', value)}
                >
                  <SelectTrigger id="volumeType">
                    <SelectValue placeholder={t('configForm.selectVolumeType')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="named">{t('configForm.namedVolume')}</SelectItem>
                    <SelectItem value="bind">{t('configForm.bindMount')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {config.volumeType === 'named' && (
                <div className="space-y-2">
                  <Label htmlFor="volumeName">{t('configForm.volumeName')}</Label>
                  <Input
                    id="volumeName"
                    value={config.volumeName || ''}
                    onChange={(e) => updateConfig('volumeName', e.target.value)}
                    placeholder="postgres-data"
                  />
                </div>
              )}

              {config.volumeType === 'bind' && (
                <div className="space-y-2">
                  <Label htmlFor="volumePath">{t('configForm.volumePath')}</Label>
                  <Input
                    id="volumePath"
                    value={config.volumePath || ''}
                    onChange={(e) => updateConfig('volumePath', e.target.value)}
                    placeholder={config.hostOS === 'windows' ? 'C:\\data\\postgres' : '/data/postgres'}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="externalDbHost">
                  {t('configForm.databaseHost')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="externalDbHost"
                  value={config.externalDbHost || ''}
                  onChange={(e) => updateConfig('externalDbHost', e.target.value)}
                  placeholder="localhost"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalDbPort">
                  {t('configForm.port')} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="externalDbPort"
                  type="number"
                  value={config.externalDbPort || '5432'}
                  onChange={(e) => updateConfig('externalDbPort', e.target.value)}
                  placeholder="5432"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extDatabase">{t('configForm.databaseName')}</Label>
                <Input
                  id="extDatabase"
                  value={config.postgresDatabase}
                  onChange={(e) => updateConfig('postgresDatabase', e.target.value)}
                  placeholder="hagicode"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extUser">{t('configForm.username')}</Label>
                <Input
                  id="extUser"
                  value={config.postgresUser}
                  onChange={(e) => updateConfig('postgresUser', e.target.value)}
                  placeholder="postgres"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="extPassword">{t('configForm.password')}</Label>
                <Input
                  id="extPassword"
                  type="text"
                  value={config.postgresPassword}
                  onChange={(e) => updateConfig('postgresPassword', e.target.value)}
                  placeholder="your-password"
                />
              </div>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Claude Code Extended Configuration - only show in full-custom mode when Claude is enabled */}
      {config.profile === 'full-custom' && claudeEnabled && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('configForm.claudeCodeExtendedConfig')}</h3>
          <p className="text-sm text-muted-foreground">
            {t('configForm.claudeCodeExtendedConfigDescription')}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sonnet Model */}
            <div className="space-y-2">
              <Label htmlFor="anthropicSonnetModel">
                {t('configForm.anthropicSonnetModel')}
              </Label>
              <Input
                id="anthropicSonnetModel"
                type="text"
                value={config.anthropicSonnetModel || ''}
                onChange={(e) => updateConfig('anthropicSonnetModel', e.target.value || undefined)}
                placeholder="claude-sonnet-4-20250514"
              />
              <p className="text-xs text-muted-foreground">
                {t('configForm.anthropicSonnetModelHint')}
              </p>
            </div>

            {/* Opus Model */}
            <div className="space-y-2">
              <Label htmlFor="anthropicOpusModel">
                {t('configForm.anthropicOpusModel')}
              </Label>
              <Input
                id="anthropicOpusModel"
                type="text"
                value={config.anthropicOpusModel || ''}
                onChange={(e) => updateConfig('anthropicOpusModel', e.target.value || undefined)}
                placeholder="claude-opus-4-20250514"
              />
              <p className="text-xs text-muted-foreground">
                {t('configForm.anthropicOpusModelHint')}
              </p>
            </div>

            {/* Haiku Model */}
            <div className="space-y-2">
              <Label htmlFor="anthropicHaikuModel">
                {t('configForm.anthropicHaikuModel')}
              </Label>
              <Input
                id="anthropicHaikuModel"
                type="text"
                value={config.anthropicHaikuModel || ''}
                onChange={(e) => updateConfig('anthropicHaikuModel', e.target.value || undefined)}
                placeholder="claude-haiku-4-20250514"
              />
              <p className="text-xs text-muted-foreground">
                {t('configForm.anthropicHaikuModelHint')}
              </p>
            </div>
          </div>

          {/* Agent Teams */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="claudeCodeExperimentalAgentTeams"
                checked={config.claudeCodeExperimentalAgentTeams || false}
                onCheckedChange={(checked) =>
                  updateConfig('claudeCodeExperimentalAgentTeams', checked as boolean)
                }
              />
              <Label htmlFor="claudeCodeExperimentalAgentTeams" className="cursor-pointer">
                {t('configForm.claudeCodeExperimentalAgentTeams')}
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('configForm.claudeCodeExperimentalAgentTeamsHint')}
            </p>
          </div>
        </div>
      )}

      {/* Volume Mounts */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('configForm.volumeMounts')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('configForm.workdirDescription')}
        </p>

        <div className="space-y-2">
          <Label htmlFor="workdirPath">
            {t('configForm.workdirPath')} <span className="text-red-500">*</span>
          </Label>
          <Input
            id="workdirPath"
            value={config.workdirPath}
            onChange={(e) => updateConfig('workdirPath', e.target.value)}
            placeholder={config.hostOS === 'windows' ? 'C:\\repos' : '/home/user/repos'}
          />
          <p className="text-xs text-muted-foreground">
            {t('configForm.workdirRecommendation')}
          </p>
        </div>

        {config.hostOS === 'linux' && config.profile === 'full-custom' && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="workdirCreatedByRoot"
                checked={config.workdirCreatedByRoot}
                onCheckedChange={(checked) =>
                  updateConfig('workdirCreatedByRoot', checked as boolean)
                }
              />
              <Label htmlFor="workdirCreatedByRoot" className="cursor-pointer">
                {t('configForm.workdirCreatedByRoot')}
              </Label>
            </div>

            {config.workdirCreatedByRoot && (
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-md">
                <p className="font-medium text-red-800 dark:text-red-200">
                  ⚠️ {t('configForm.permissionIssueWarning')}
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  {t('configForm.permissionIssueDescription')}
                </p>
                <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 mt-2 space-y-1">
                  <li>
                    {t('configForm.changeDirPermissions')}{' '}
                    <code className="bg-red-100 dark:bg-red-900 px-1 rounded">
                      chmod 777 /path/to/repos
                    </code>
                  </li>
                  <li>{t('configForm.createNonRootUser')}</li>
                </ul>
              </div>
            )}

            {!config.workdirCreatedByRoot && config.profile === 'full-custom' && (
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-md">
                <p className="font-medium">{t('configForm.configureUserPermission')}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('configForm.configureUserPermissionDescription')}
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t('configForm.getCurrentUserId')}{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">id username</code>
                  <br />
                  {t('configForm.outputExample')}{' '}
                  <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">
                    uid=1000(user) gid=1000(user)
                  </code>
                </p>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="puid">
                      {t('configForm.puid')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="puid"
                      value={config.puid}
                      onChange={(e) => updateConfig('puid', e.target.value)}
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pgid">
                      {t('configForm.pgid')} <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="pgid"
                      value={config.pgid}
                      onChange={(e) => updateConfig('pgid', e.target.value)}
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>
            )}

            {config.workdirCreatedByRoot && config.profile === 'full-custom' && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-md">
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  ℹ️ {t('configForm.permissionNotRequired')}
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-2">
                  {t('configForm.permissionNotRequiredDescription')}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* License Configuration */}
      {config.profile === 'full-custom' && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">{t('configForm.licenseConfig')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="licenseKeyType">{t('configForm.licenseKeyType')}</Label>
            <Select
              value={config.licenseKeyType}
              onValueChange={(value: 'public' | 'custom') => updateConfig('licenseKeyType', value)}
            >
              <SelectTrigger id="licenseKeyType">
                <SelectValue placeholder={t('configForm.selectLicenseType')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">{t('configForm.publicTestKey')}</SelectItem>
                <SelectItem value="custom">{t('configForm.customKey')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {config.licenseKeyType === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="licenseKey">{t('configForm.customLicenseKey')}</Label>
              <Input
                id="licenseKey"
                value={config.licenseKey}
                onChange={(e) => updateConfig('licenseKey', e.target.value)}
                placeholder="Enter your license key"
              />
            </div>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
