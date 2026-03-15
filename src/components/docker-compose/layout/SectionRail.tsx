import { ArrowRight, Eye, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import { SectionStatusBadge } from './SectionStatusBadge';
import type { WorkspaceSection, WorkspaceSectionChildId, WorkspaceSectionId } from './workspaceSections';

interface SectionRailProps {
  sections: WorkspaceSection[];
  activeSectionId?: WorkspaceSectionId;
  activeNavTargetId?: WorkspaceSectionId | WorkspaceSectionChildId;
  onSelectSection: (sectionId: WorkspaceSectionId) => void;
  onSelectSectionChild: (sectionId: WorkspaceSectionId, childId: WorkspaceSectionChildId) => void;
  onOpenPreview: () => void;
}

export function SectionRail({
  sections,
  activeSectionId,
  activeNavTargetId,
  onSelectSection,
  onSelectSectionChild,
  onOpenPreview,
}: SectionRailProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-border/70 bg-card/90 shadow-sm">
      <CardHeader className="border-b border-border/60">
        <CardTitle>{t('workspace.navigationTitle')}</CardTitle>
        <CardDescription>{t('workspace.navigationDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <nav aria-label={t('workspace.navigationTitle')} className="space-y-2">
          {sections.map((section, index) => {
            const isActive = section.id === activeSectionId;

            return (
              <Button
                key={section.id}
                type="button"
                variant="ghost"
                onClick={() => onSelectSection(section.id)}
                className={cn(
                  'h-auto w-full items-start justify-between rounded-2xl border px-4 py-3 text-left transition-all',
                  isActive
                    ? 'border-primary/40 bg-primary/10 text-foreground shadow-sm'
                    : 'border-border/60 bg-background/70 hover:bg-muted/70'
                )}
                aria-current={isActive ? 'location' : undefined}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span>{t(section.shortTitleKey)}</span>
                  </div>
                  <p className="text-sm font-medium">{t(section.titleKey)}</p>
                  <p className="text-xs text-muted-foreground">{t(section.descriptionKey)}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <SectionStatusBadge
                    status={section.status}
                    count={section.status === 'error' ? section.errorCount : undefined}
                  />
                  <ArrowRight className="size-4 text-muted-foreground" />
                </div>
              </Button>
            );
          })}
        </nav>

        {sections.find((section) => section.id === 'executors')?.children.length ? (
          <div className="rounded-2xl border border-border/60 bg-background/80 p-3">
            <p className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              {t('workspace.executorItemsTitle')}
            </p>
            <div className="space-y-2">
              {sections
                .find((section) => section.id === 'executors')
                ?.children.map((child) => {
                  const isChildActive = activeNavTargetId === child.id;
                  const childStatus = child.errorCount > 0
                    ? 'error'
                    : child.isComplete
                      ? 'complete'
                      : 'pending';

                  return (
                    <Button
                      key={child.id}
                      type="button"
                      variant="ghost"
                      onClick={() => onSelectSectionChild(child.parentId, child.id)}
                      className={cn(
                        'h-auto w-full items-start justify-between rounded-xl border px-3 py-2.5 text-left transition-all',
                        isChildActive
                          ? 'border-primary/35 bg-primary/10 text-foreground'
                          : 'border-border/50 bg-muted/20 hover:bg-muted/50'
                      )}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{t(child.titleKey)}</p>
                        <p className="text-xs text-muted-foreground">{t(child.descriptionKey)}</p>
                      </div>
                      <SectionStatusBadge
                        status={childStatus}
                        count={childStatus === 'error' ? child.errorCount : undefined}
                        className="shrink-0"
                      />
                    </Button>
                  );
                })}
            </div>
          </div>
        ) : null}

        <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{t('workspace.previewShortcutTitle')}</p>
              <p className="text-xs text-muted-foreground">{t('workspace.previewShortcutDescription')}</p>
            </div>
            <Eye className="size-4 text-muted-foreground" />
          </div>
          <Button type="button" variant="outline" className="w-full justify-between" onClick={onOpenPreview}>
            <span>{t('workspace.openPreview')}</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>

        <div className="rounded-2xl border border-border/60 bg-background/80 p-4">
          <p className="mb-3 text-sm font-medium">{t('workspace.statusLegendTitle')}</p>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <SectionStatusBadge status="active" />
            <SectionStatusBadge status="complete" />
            <SectionStatusBadge status="pending" />
            <span className="inline-flex items-center gap-1 rounded-full border border-destructive/30 bg-destructive/5 px-2 py-1 text-destructive">
              <TriangleAlert className="size-3.5" />
              {t('workspace.status.error')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
