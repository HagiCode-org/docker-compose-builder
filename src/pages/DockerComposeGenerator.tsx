import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Dock, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { ConfigForm } from '@/components/docker-compose/ConfigForm';
import { ConfigPreview } from '@/components/docker-compose/ConfigPreview';
import { MobilePreviewDrawer } from '@/components/docker-compose/layout/MobilePreviewDrawer';
import { SectionRail } from '@/components/docker-compose/layout/SectionRail';
import { WorkspaceIntro } from '@/components/docker-compose/layout/WorkspaceIntro';
import { WorkspaceShell } from '@/components/docker-compose/layout/WorkspaceShell';
import { SiteFooter } from '@/components/Footer/SiteFooter';
import {
  findFirstErrorSection,
  getWorkspaceSections,
  getWorkspaceSummary,
  isWorkspaceExportReady,
  type WorkspaceSectionChildId,
  type WorkspaceSectionId,
} from '@/components/docker-compose/layout/workspaceSections';
import { NavigationLinks } from '@/components/Header/NavigationLinks';
import { selectConfig } from '@/lib/docker-compose/slice';
import { validateConfig } from '@/lib/docker-compose/validation';
import { Button } from '@/components/ui/button';

const toSectionElementId = (sectionId: WorkspaceSectionId) => `section-${sectionId}`;
const stickyHeaderOffset = 112;

function scrollToTarget(target: HTMLElement) {
  const top = window.scrollY + target.getBoundingClientRect().top - stickyHeaderOffset;
  window.scrollTo({
    top: Math.max(top, 0),
    behavior: 'smooth',
  });
}

export function DockerComposeGenerator() {
  const { t } = useTranslation();
  const config = useSelector(selectConfig);
  const [activeNavTargetId, setActiveNavTargetId] = useState<WorkspaceSectionId | WorkspaceSectionChildId | undefined>();

  const validationErrors = useMemo(() => validateConfig(config), [config]);
  const baseSections = useMemo(
    () => getWorkspaceSections(config, validationErrors),
    [config, validationErrors]
  );
  const activeSectionId = useMemo(() => {
    if (activeNavTargetId && baseSections.some((section) => section.id === activeNavTargetId)) {
      return activeNavTargetId as WorkspaceSectionId;
    }

    if (activeNavTargetId) {
      const parentSection = baseSections.find((section) =>
        section.children.some((child) => child.id === activeNavTargetId)
      );
      if (parentSection) {
        return parentSection.id;
      }
    }

    return baseSections[0]?.id ?? 'profile';
  }, [baseSections, activeNavTargetId]);
  const sections = useMemo(
    () => getWorkspaceSections(config, validationErrors, activeSectionId),
    [config, validationErrors, activeSectionId]
  );
  const summary = useMemo(() => getWorkspaceSummary(sections), [sections]);
  const firstErrorSection = useMemo(() => findFirstErrorSection(sections), [sections]);
  const exportReady = isWorkspaceExportReady(sections);
  const observableTargetIds = useMemo(
    () => [
      ...sections.map((section) => toSectionElementId(section.id)),
      ...sections.flatMap((section) => section.children.map((child) => child.id)),
    ],
    [sections]
  );

  const handleSelectSection = useCallback((sectionId: WorkspaceSectionId) => {
    setActiveNavTargetId(sectionId);

    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const target = document.getElementById(toSectionElementId(sectionId));
    if (!target) {
      return;
    }

    scrollToTarget(target);
    requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  }, []);

  const handleSelectSectionChild = useCallback((sectionId: WorkspaceSectionId, childId: WorkspaceSectionChildId) => {
    setActiveNavTargetId(childId);

    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const target = document.getElementById(childId) ?? document.getElementById(toSectionElementId(sectionId));
    if (!target) {
      return;
    }

    scrollToTarget(target);
    requestAnimationFrame(() => {
      target.focus({ preventScroll: true });
    });
  }, []);

  const handleOpenPreview = useCallback(() => {
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }

    const preview = document.getElementById('workspace-preview');
    if (preview) {
      scrollToTarget(preview);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const elements = observableTargetIds
      .map((targetId) => document.getElementById(targetId))
      .filter((element): element is HTMLElement => Boolean(element));

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

        if (!visibleEntry) {
          return;
        }

        const nextTargetId = (visibleEntry.target.id.startsWith('section-')
          ? visibleEntry.target.id.replace('section-', '')
          : visibleEntry.target.id) as WorkspaceSectionId | WorkspaceSectionChildId;
        setActiveNavTargetId((current) => (current === nextTargetId ? current : nextTargetId));
      },
      {
        rootMargin: '-18% 0px -55% 0px',
        threshold: [0.2, 0.45, 0.7],
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [observableTargetIds]);

  const previewPanel = (
    <div id="workspace-preview">
      <ConfigPreview sections={sections} onSelectSection={handleSelectSection} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.10),transparent_30%),linear-gradient(180deg,rgba(15,23,42,0.03),transparent_22%),linear-gradient(135deg,var(--background),color-mix(in_oklab,var(--background)_86%,var(--muted)_14%))]">
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-primary/10 shadow-sm">
                <Dock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight">{t('header.title')}</h1>
                <p className="hidden text-sm text-muted-foreground sm:block">{t('workspace.headerSubtitle')}</p>
              </div>
            </div>
            <NavigationLinks />
          </div>
        </div>
      </header>

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <WorkspaceShell
          intro={
            <WorkspaceIntro
              totalSections={summary.total}
              completedSections={summary.completed}
              errorCount={summary.errored}
              exportReady={exportReady}
              actions={
                firstErrorSection ? (
                  <Button type="button" variant="outline" onClick={() => handleSelectSection(firstErrorSection.id)}>
                    <TriangleAlert className="size-4" />
                    <span>{t('workspace.jumpToFirstError')}</span>
                  </Button>
                ) : undefined
              }
            />
          }
          mobilePreviewTrigger={<MobilePreviewDrawer preview={previewPanel} />}
          rail={
            <SectionRail
              sections={sections}
              activeSectionId={activeSectionId}
              activeNavTargetId={activeNavTargetId}
              onSelectSection={handleSelectSection}
              onSelectSectionChild={handleSelectSectionChild}
              onOpenPreview={handleOpenPreview}
            />
          }
          editor={<ConfigForm sections={sections} onSelectSection={handleSelectSection} />}
          preview={previewPanel}
        />
      </main>
      <SiteFooter />
    </div>
  );
}
