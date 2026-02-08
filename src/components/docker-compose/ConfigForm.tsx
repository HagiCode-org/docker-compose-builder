import { useSelector, useDispatch } from 'react-redux';
import { selectConfig, setConfigField } from '@/lib/docker-compose/slice';
import type { DockerComposeConfig, ConfigProfile } from '@/lib/docker-compose/types';
import { REGISTRIES, ZAI_API_URL } from '@/lib/docker-compose/types';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { NAVIGATION_LINKS } from '@/config/navigationLinks';

export function ConfigForm() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const config = useSelector(selectConfig);

  const updateConfig = <K extends keyof DockerComposeConfig>(field: K, value: DockerComposeConfig[K]) => {
    dispatch(setConfigField({ field, value }));
  };

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
                遇到困难？欢迎加入 QQ 群 {NAVIGATION_LINKS.qqGroup.groupNumber} 解决
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

      {/* Claude API Configuration */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('configForm.claudeApiConfig')}</h3>
        <p className="text-sm text-muted-foreground">
          {t('configForm.unifiedUseOfToken')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiProvider">
              {t('configForm.apiProvider')} <span className="text-red-500">*</span>
            </Label>
            <Select
              value={config.anthropicApiProvider}
              onValueChange={(value: 'anthropic' | 'zai' | 'custom') =>
                updateConfig('anthropicApiProvider', value)
              }
            >
              <SelectTrigger id="apiProvider">
                <SelectValue placeholder={t('configForm.selectApiProvider')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="zai">
                  <div className="flex items-center gap-2">
                    <span>{t('configForm.zhipuAI')}</span>
                    <Badge variant="secondary">{t('common.default')}</Badge>
                  </div>
                </SelectItem>
                <SelectItem value="anthropic">{t('configForm.anthropicOfficialApi')}</SelectItem>
                <SelectItem value="custom">{t('configForm.customApiEndpoint')}</SelectItem>
              </SelectContent>
            </Select>

            {config.anthropicApiProvider === 'zai' && (
              <a
                href="https://www.bigmodel.cn/claude-code?ic=14BY54APZA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                {t('configForm.getApiToken')}
              </a>
            )}

            {config.anthropicApiProvider === 'anthropic' && (
              <a
                href="https://console.anthropic.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                {t('configForm.getApiToken')}
              </a>
            )}
          </div>

          <div className="space-y-2">
            {config.anthropicApiProvider === 'custom' && (
              <>
                <Label htmlFor="anthropicUrl">{t('configForm.apiEndpointUrl')}</Label>
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
              config.anthropicApiProvider === 'anthropic'
                ? t('configForm.enterAnthropicApiToken')
                : t('configForm.enterApiToken')
            }
          />

          {config.anthropicApiProvider === 'zai' && (
            <div className="mt-2 p-3 bg-green-50 dark:bg-green-950 rounded-md text-sm">
              <p>{t('configForm.apiEndpointAutoSet')}: {ZAI_API_URL}</p>
            </div>
          )}

          {config.anthropicApiProvider === 'anthropic' && (
            <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md text-sm">
              <p>{t('configForm.usingOfficialApi')}</p>
            </div>
          )}

          {config.anthropicApiProvider === 'custom' && (
            <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-md text-sm">
              <p>{t('configForm.usingCustomEndpoint')}</p>
            </div>
          )}
        </div>
      </div>

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
