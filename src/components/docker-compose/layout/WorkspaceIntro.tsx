import type { ReactNode } from 'react';
import { Layers3, ListChecks, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WorkspaceIntroProps {
  totalSections: number;
  completedSections: number;
  errorCount: number;
  exportReady: boolean;
  actions?: ReactNode;
}

export function WorkspaceIntro({
  totalSections,
  completedSections,
  errorCount,
  exportReady,
  actions,
}: WorkspaceIntroProps) {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex flex-wrap gap-3">
        <MetricPill
          icon={<Layers3 className="size-4" />}
          label={t('workspace.metrics.modules')}
          value={`${totalSections}`}
        />
        <MetricPill
          icon={<ListChecks className="size-4" />}
          label={t('workspace.metrics.completed')}
          value={`${completedSections}/${totalSections}`}
        />
        <MetricPill
          icon={<TriangleAlert className="size-4" />}
          label={t('workspace.metrics.errors')}
          value={`${errorCount}`}
        />
        <MetricPill
          icon={<ListChecks className="size-4" />}
          label={t('workspace.metrics.export')}
          value={exportReady ? t('workspace.exportReady') : t('workspace.exportBlocked')}
        />
      </div>

      {actions ? <div className="flex flex-wrap gap-2 xl:justify-end">{actions}</div> : null}
    </div>
  );
}

interface MetricPillProps {
  icon: ReactNode;
  label: string;
  value: string;
}

function MetricPill({ icon, label, value }: MetricPillProps) {
  return (
    <div className="inline-flex items-center gap-3 rounded-2xl border border-border/60 bg-background/65 px-4 py-3">
      <div className="inline-flex rounded-full bg-primary/10 p-2 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
