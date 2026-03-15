import { AlertTriangle, CheckCircle2, Clock3, Focus } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { WorkspaceSectionStatus } from './workspaceSections';

interface SectionStatusBadgeProps {
  status: WorkspaceSectionStatus;
  count?: number;
  className?: string;
}

const statusIconMap = {
  active: Focus,
  complete: CheckCircle2,
  error: AlertTriangle,
  pending: Clock3,
} as const;

const statusVariantMap: Record<WorkspaceSectionStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  active: 'default',
  complete: 'secondary',
  error: 'destructive',
  pending: 'outline',
};

export function SectionStatusBadge({ status, count, className }: SectionStatusBadgeProps) {
  const { t } = useTranslation();
  const Icon = statusIconMap[status];

  return (
    <Badge
      variant={statusVariantMap[status]}
      className={cn('gap-1.5 rounded-full px-2.5 py-1 text-[11px] uppercase tracking-[0.16em]', className)}
    >
      <Icon className="size-3.5" />
      <span>{t(`workspace.status.${status}`)}</span>
      {typeof count === 'number' && count > 0 ? <span aria-hidden="true">({count})</span> : null}
    </Badge>
  );
}
