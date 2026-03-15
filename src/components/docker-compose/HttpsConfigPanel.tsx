import { useMemo } from 'react';
import type { DockerComposeConfig } from '@/lib/docker-compose/types';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CertificateGuide } from './CertificateGuide';
import { PortConfigInput } from './PortConfigInput';
import { IpConfigInput } from './IpConfigInput';
import { CaddyfilePreview } from './CaddyfilePreview';
import { buildCaddyfile } from '@/lib/docker-compose/generator';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, ShieldOff } from 'lucide-react';

interface HttpsConfigPanelProps {
  config: DockerComposeConfig;
  updateConfig: <K extends keyof DockerComposeConfig>(field: K, value: DockerComposeConfig[K]) => void;
  validationErrors?: Record<string, string>;
}

export function HttpsConfigPanel({ config, updateConfig, validationErrors = {} }: HttpsConfigPanelProps) {
  const { t } = useTranslation();
  const caddyfile = useMemo(() => buildCaddyfile(config), [config]);
  const accessUrl = `https://${config.lanIp}:${config.httpsPort || '443'}`;
  const StatusIcon = config.enableHttps ? ShieldCheck : ShieldOff;

  return (
    <div className="space-y-4 rounded-2xl border border-border/60 bg-muted/20 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-medium">
            <StatusIcon className="size-4 text-primary" />
            <span>{t('workspace.httpsPanelTitle')}</span>
          </div>
          <p className="text-sm text-muted-foreground">{t('configForm.enableHttpsHelp')}</p>
        </div>
        <Badge variant={config.enableHttps ? 'default' : 'secondary'}>
          {config.enableHttps ? t('configForm.httpsEnabled') : t('configForm.httpsDisabled')}
        </Badge>
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="enableHttps"
          checked={config.enableHttps}
          onCheckedChange={(checked) => updateConfig('enableHttps', checked as boolean)}
        />
        <Label htmlFor="enableHttps" className="cursor-pointer">
          {t('configForm.enableHttps')}
        </Label>
      </div>
      {config.enableHttps && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PortConfigInput
              id="httpsPort"
              label={t('configForm.httpsPort')}
              value={config.httpsPort}
              onChange={(value) => updateConfig('httpsPort', value)}
              helpText={t('configForm.httpsPortHelp')}
              error={validationErrors.httpsPort}
            />
            <IpConfigInput
              id="lanIp"
              label={t('configForm.lanIp')}
              value={config.lanIp}
              onChange={(value) => updateConfig('lanIp', value)}
              placeholder="192.168.1.100"
              helpText={t('configForm.lanIpHelp')}
              error={validationErrors.lanIp}
            />
          </div>

          <div className="flex items-center justify-between gap-2 rounded-xl border bg-background/70 px-3 py-2">
            <span className="text-sm">{t('configForm.accessUrl')}</span>
            <code className="text-xs">{accessUrl}</code>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/docs/https-certificate-guide.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              {t('configForm.certificateTrustGuide')}
            </a>
            <a
              href="/docs/https-certificate-guide.md#faq"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary underline"
            >
              {t('configForm.troubleshooting')}
            </a>
          </div>

          <CertificateGuide
            title={t('configForm.certificateGuideTitle')}
            description={t('configForm.certificateGuideDescription')}
            detailsLabel={t('configForm.certificateGuideDetails')}
            docsHref="/docs/https-certificate-guide.md"
            docsLabel={t('configForm.certificateTrustGuide')}
          />

          <CaddyfilePreview content={caddyfile} generatedAt={new Date()} serviceCount={1} />

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              updateConfig('httpsPort', '443');
              updateConfig('lanIp', '192.168.1.100');
            }}
          >
            {t('configForm.resetHttps')}
          </Button>
        </div>
      )}
    </div>
  );
}
