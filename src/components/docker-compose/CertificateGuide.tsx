import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, ShieldCheck, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface CertificateGuideProps {
  title: string;
  description: string;
  detailsLabel: string;
  docsHref: string;
  docsLabel: string;
}

export function CertificateGuide({
  title,
  description,
  detailsLabel,
  docsHref,
  docsLabel,
}: CertificateGuideProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <p className="text-sm font-medium">{title}</p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setDismissed(true)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">{description}</p>

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="px-0 h-7 text-xs">
            {detailsLabel}
            {open ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="text-xs text-muted-foreground space-y-1 mt-1">
            <p>{t('configForm.certificateStep1')}</p>
            <p>{t('configForm.certificateStep2')}</p>
            <p>{t('configForm.certificateStep3')}</p>
            <a className="text-primary underline" href={docsHref} target="_blank" rel="noopener noreferrer">
              {docsLabel}
            </a>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
