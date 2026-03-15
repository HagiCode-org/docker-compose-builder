import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface WorkspaceShellProps {
  intro: ReactNode;
  rail: ReactNode;
  editor: ReactNode;
  preview: ReactNode;
  mobilePreviewTrigger?: ReactNode;
  className?: string;
}

export function WorkspaceShell({
  intro,
  rail,
  editor,
  preview,
  mobilePreviewTrigger,
  className,
}: WorkspaceShellProps) {
  return (
    <div className={cn('space-y-6 lg:space-y-8', className)}>
      {intro}

      <div className="lg:hidden">{mobilePreviewTrigger}</div>
      <div className="xl:hidden">{rail}</div>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_minmax(0,1fr)]">
        <aside className="hidden xl:block xl:sticky xl:top-24 xl:self-start">{rail}</aside>
        <section className="min-w-0">{editor}</section>
        <aside className="hidden xl:block xl:sticky xl:top-24 xl:self-start">{preview}</aside>
      </div>
      <div className="hidden lg:block xl:hidden">{preview}</div>
    </div>
  );
}
