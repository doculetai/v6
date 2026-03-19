'use client';

import { CaretLeft } from '@/components/icons';
import { dashboardShellCopy } from '@/config/copy/dashboard-shell';

type SidebarCollapseButtonProps = {
  onClick: () => void;
};

export function SidebarCollapseButton({ onClick }: SidebarCollapseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dashboardShellCopy.sidebar.collapseLabel}
      className="ml-auto flex size-7 shrink-0 items-center justify-center rounded-md bg-sidebar-foreground/[0.04] text-sidebar-foreground/35 transition-colors hover:bg-sidebar-foreground/[0.07] hover:text-sidebar-foreground/65 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
    >
      <CaretLeft className="size-3" weight="bold" aria-hidden="true" />
    </button>
  );
}
