import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectConfig } from '@/lib/docker-compose/slice';
import { generateYAML } from '@/lib/docker-compose/generator';
import { SyntaxHighlighter } from '@/components/ui/syntax-highlighter';
import { Button } from '@/components/ui/button';
import { Copy, Download, Check, FileCode } from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/theme-context';

export function ConfigPreview() {
  const { t } = useTranslation();
  const { theme } = useTheme();
  const config = useSelector(selectConfig);
  const [copied, setCopied] = useState(false);

  const yaml = useMemo(() => generateYAML(config), [config]);
  const darkMode = theme === 'dark';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(yaml);
      setCopied(true);
      toast.success(t('configPreview.yamlCopiedSuccess'));
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error(t('configPreview.yamlCopiedError'));
    }
  };

  const handleDownload = () => {
    const blob = new Blob([yaml], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'docker-compose.yml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t('configPreview.downloadSuccess'));
  };

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-card/80 to-card/60 backdrop-blur-xl rounded-2xl border shadow-lg hover:shadow-xl transition-all duration-300">
      <Toaster />

      {/* Preview Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
            <FileCode className="w-4 h-4 text-primary" />
          </div>
          <h3 className="text-lg font-semibold">{t('configPreview.generatedConfiguration')}</h3>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={handleCopy}
            className="flex items-center gap-2 hover:bg-accent transition-colors duration-200"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">
              {copied ? t('configPreview.copied') : t('configPreview.copy')}
            </span>
          </Button>
          <Button
            size="sm"
            onClick={handleDownload}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity duration-200"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{t('configPreview.download')}</span>
          </Button>
        </div>
      </div>

      {/* YAML Preview */}
      <div className="bg-background/95 backdrop-blur-sm rounded-xl border overflow-hidden shadow-inner">
        <div className="bg-muted/50 backdrop-blur-sm px-4 py-2.5 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="text-xs text-muted-foreground font-mono ml-2">
              docker-compose.yml
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            {yaml.split('\n').length} lines
          </div>
        </div>
        <div className="p-4 overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar">
          <SyntaxHighlighter
            language="yaml"
            className="text-sm"
            darkMode={darkMode}
          >
            {yaml}
          </SyntaxHighlighter>
        </div>
      </div>

      {/* Configuration Info */}
      <div className="text-xs text-muted-foreground space-y-1 px-1">
        <p>{t('configPreview.generatedAt')} {new Date().toLocaleString()}</p>
        <p>{t('configPreview.basedOnSettings')}</p>
      </div>
    </div>
  );
}
