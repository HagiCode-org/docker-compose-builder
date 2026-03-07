import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isLocalhostHost, parseHostWithOptionalPort } from '@/validators/ipValidator';
import { useTranslation } from 'react-i18next';
import { CircleHelp } from 'lucide-react';

interface IpConfigInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  helpText?: string;
  error?: string;
}

export function IpConfigInput({
  id,
  label,
  value,
  onChange,
  placeholder,
  helpText,
  error,
}: IpConfigInputProps) {
  const { t } = useTranslation();
  const parsed = parseHostWithOptionalPort(value);
  const showLocalhostWarning = parsed ? isLocalhostHost(parsed.host) : false;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label htmlFor={id}>{label}</Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button type="button" aria-label={t('configForm.lanIpTooltipLabel')}>
                <CircleHelp className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('configForm.lanIpTooltipText')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      <p className="text-xs text-muted-foreground">{t('configForm.lanIpExamples')}</p>
      {showLocalhostWarning && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t('configForm.localhostLanWarning')}
        </p>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
