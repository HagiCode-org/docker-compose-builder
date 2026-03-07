import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';

interface PortConfigInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  helpText?: string;
  error?: string;
}

export function PortConfigInput({
  id,
  label,
  value,
  onChange,
  helpText,
  error,
}: PortConfigInputProps) {
  const { t } = useTranslation();
  const numericValue = Number(value);
  const privilegedPortWarning =
    Number.isFinite(numericValue) && numericValue > 0 && numericValue < 1024;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="number"
        min={1}
        max={65535}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="text-xs px-2 py-1 border rounded hover:bg-accent"
          onClick={() => onChange('443')}
        >
          443
        </button>
        <button
          type="button"
          className="text-xs px-2 py-1 border rounded hover:bg-accent"
          onClick={() => onChange('8443')}
        >
          8443
        </button>
      </div>
      {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
      {privilegedPortWarning && (
        <p className="text-xs text-amber-600 dark:text-amber-400">
          {t('configForm.privilegedPortWarning')}
        </p>
      )}
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}
