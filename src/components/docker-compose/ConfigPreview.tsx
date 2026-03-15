import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Check, Copy, Download, FileCode, ListChecks, TriangleAlert } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useTranslation } from 'react-i18next';

import { selectConfig, selectProviderById } from '@/lib/docker-compose/slice';
import { generateYAML } from '@/lib/docker-compose/generator';
import { copyToClipboard, downloadComposeYaml } from '@/lib/docker-compose/exportUtils';
import type { RootState } from '@/lib/store';
import { SyntaxHighlighter } from '@/components/ui/syntax-highlighter';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';
import {
  isWorkspaceExportReady,
  type WorkspaceSection,
  type WorkspaceSectionId,
} from '@/components/docker-compose/layout/workspaceSections';

interface ConfigPreviewProps {
  sections: WorkspaceSection[];
  onSelectSection: (sectionId: WorkspaceSectionId) => void;
  className?: string;
}

export function ConfigPreview({ sections, onSelectSection, className }: ConfigPreviewProps) {
  const { t, i18n } = useTranslation();
  const { theme } = useTheme();
  const config = useSelector(selectConfig);
  const [copied, setCopied] = useState(false);

  const providerConfig = useSelector((state: RootState) => selectProviderById(state, config.anthropicApiProvider));

  const yaml = useMemo(() => generateYAML(config, providerConfig, i18n.language), [config, providerConfig, i18n.language]);
  const errorSections = useMemo(() => sections.filter((section) => section.errorCount > 0), [sections]);
  const exportDisabled = !isWorkspaceExportReady(sections);
  const darkMode = theme === 'dark';

  const handleCopy = async () => {
    try {
      await copyToClipboard(yaml);
      setCopied(true);
      toast.success(t('configPreview.yamlCopiedSuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error(t('configPreview.yamlCopiedError'));
    }
  };

  const handleDownload = () => {
    if (exportDisabled) {
      toast.error(t('configPreview.invalidConfigCannotExport'));
      return;
    }
    downloadComposeYaml(yaml);
    toast.success(t('configPreview.downloadSuccess'));
  };

  return (
    <div className={cn('space-y-4 rounded-[28px] border border-border/70 bg-card/95 p-5 shadow-sm lg:p-6', className)}>
      <Toaster />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10">
              <FileCode className="size-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{t('configPreview.generatedConfiguration')}</h3>
              <p className="text-sm text-muted-foreground">{t('configPreview.previewDescription')}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <Badge variant={exportDisabled ? 'destructive' : 'secondary'}>
              {exportDisabled ? t('workspace.exportBlocked') : t('workspace.exportReady')}
            </Badge>
            <span>{yaml.split('\n').length} {t('configPreview.lines')}</span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            disabled={exportDisabled}
            className="justify-center gap-2"
          >
            {copied ? <Check className="size-4 text-emerald-500" /> : <Copy className="size-4" />}
            <span>{copied ? t('configPreview.copied') : t('configPreview.copy')}</span>
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            disabled={exportDisabled}
            className="justify-center gap-2"
          >
            <Download className="size-4" />
            <span>{t('configPreview.download')}</span>
          </Button>
        </div>
      </div>

      {exportDisabled ? (
        <Alert variant="destructive" className="rounded-2xl border-destructive/30 bg-destructive/5">
          <TriangleAlert className="size-4" />
          <AlertTitle>{t('configPreview.exportBlockedTitle')}</AlertTitle>
          <AlertDescription>
            <p>{t('configPreview.exportBlockedDescription')}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {errorSections.map((section) => (
                <Button
                  key={section.id}
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-destructive/30 bg-background"
                  onClick={() => onSelectSection(section.id)}
                >
                  <ListChecks className="size-4" />
                  <span>{t(section.shortTitleKey)}</span>
                  <span className="text-xs text-muted-foreground">({section.errorCount})</span>
                </Button>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="rounded-2xl border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-950 dark:bg-emerald-950/25 dark:text-emerald-100">
          <Check className="size-4" />
          <AlertTitle>{t('configPreview.exportReadyTitle')}</AlertTitle>
          <AlertDescription>{t('configPreview.exportReadyDescription')}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-hidden rounded-[24px] border border-border/70 bg-background/95 shadow-inner">
        <div className="flex items-center justify-between border-b border-border/60 bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-2 text-xs font-mono text-muted-foreground">docker-compose.yml</span>
          </div>
          <span className="text-xs text-muted-foreground">{t('configPreview.livePreview')}</span>
        </div>
        <div className="custom-scrollbar max-h-[65vh] overflow-auto p-4 xl:max-h-[72vh]">
          <SyntaxHighlighter language="yaml" className="text-sm" darkMode={darkMode}>
            {yaml}
          </SyntaxHighlighter>
        </div>
      </div>

      <div className="space-y-1 px-1 text-xs text-muted-foreground">
        <p>{t('configPreview.generatedAt')} {new Date().toLocaleString()}</p>
        <p>{t('configPreview.basedOnSettings')}</p>
        {exportDisabled ? <p>{t('configPreview.invalidConfigCannotExport')}</p> : null}
      </div>
    </div>
  );
}
