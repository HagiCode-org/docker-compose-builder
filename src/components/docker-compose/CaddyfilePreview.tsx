import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { SyntaxHighlighter } from '@/components/ui/syntax-highlighter';
import { Check, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { copyToClipboard } from '@/lib/docker-compose/exportUtils';
import { useTranslation } from 'react-i18next';

interface CaddyfilePreviewProps {
  content: string;
  generatedAt: Date;
  serviceCount: number;
}

export function CaddyfilePreview({ content, generatedAt, serviceCount }: CaddyfilePreviewProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const { theme } = useTheme();

  const lineCount = useMemo(() => content.split('\n').length, [content]);

  const handleCopy = async () => {
    try {
      await copyToClipboard(content);
      setCopyStatus('success');
      setTimeout(() => setCopyStatus('idle'), 2000);
    } catch {
      setCopyStatus('error');
      setTimeout(() => setCopyStatus('idle'), 2000);
    }
  };

  return (
    <div className="rounded-lg border bg-background/60">
      <div className="px-3 py-2 border-b flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">{t('configForm.caddyPreviewTitle')}</p>
          <p className="text-xs text-muted-foreground">
            {lineCount} lines · {serviceCount} service · {generatedAt.toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            {copyStatus === 'success' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span className="ml-1">
              {copyStatus === 'success'
                ? t('configForm.caddyPreviewCopied')
                : copyStatus === 'error'
                  ? t('configForm.caddyPreviewRetryCopy')
                  : t('configForm.caddyPreviewCopy')}
            </span>
          </Button>
          <Collapsible open={expanded} onOpenChange={setExpanded}>
            <CollapsibleTrigger asChild>
              <Button size="icon" variant="ghost" className="h-8 w-8">
                {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent />
          </Collapsible>
        </div>
      </div>
      {copyStatus === 'error' && (
        <p className="px-3 py-1 text-xs text-red-600 dark:text-red-400">
          {t('configForm.caddyPreviewCopyError')}
        </p>
      )}
      {expanded && (
        <div className="p-3 max-h-80 overflow-auto">
          <SyntaxHighlighter
            language="nginx"
            darkMode={theme === 'dark'}
            showLineNumbers
            highlightPattern={/tls internal/}
          >
            {content}
          </SyntaxHighlighter>
          <p className="text-xs text-muted-foreground mt-2">
            {t('configForm.caddyPreviewTlsHint')}
          </p>
        </div>
      )}
    </div>
  );
}
