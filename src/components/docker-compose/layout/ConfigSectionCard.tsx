import type { ReactNode } from 'react';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { SectionStatusBadge } from './SectionStatusBadge';
import type { WorkspaceSection } from './workspaceSections';

interface ConfigSectionCardProps {
  section: WorkspaceSection;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ConfigSectionCard({
  section,
  children,
  className,
  action,
}: ConfigSectionCardProps) {
  const { t } = useTranslation();

  return (
    <Card
      id={`section-${section.id}`}
      tabIndex={-1}
      className={cn(
        'scroll-mt-28 border-border/70 bg-card/95 shadow-sm transition-shadow',
        section.status === 'active' && 'ring-2 ring-primary/20 shadow-lg',
        section.status === 'error' && 'border-destructive/40 ring-1 ring-destructive/15',
        className
      )}
    >
      <CardHeader className="border-b border-border/60">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg">{t(section.titleKey)}</CardTitle>
            <CardDescription>{t(section.descriptionKey)}</CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <SectionStatusBadge
              status={section.status}
              count={section.status === 'error' ? section.errorCount : undefined}
            />
            {action}
          </div>
        </div>

        {section.errorCount > 0 ? (
          <div className="mt-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="size-4" />
              <span>{t('workspace.inlineErrorsTitle', { count: section.errorCount })}</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
              {section.errorFields.map((error) => (
                <li key={`${section.id}-${error.field}`} className="flex items-start gap-2">
                  <ArrowRight className="mt-0.5 size-3.5 text-destructive" />
                  <span>{error.message}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardHeader>

      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

interface SectionJumpActionProps {
  label: string;
  onClick: () => void;
}

export function SectionJumpAction({ label, onClick }: SectionJumpActionProps) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      {label}
    </Button>
  );
}
