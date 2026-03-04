import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type SidebarToggleProps = {
  isCollapsed: boolean;
  onToggle: () => void;
};

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  const label = isCollapsed ? 'Expand sidebar' : 'Collapse sidebar';

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      className={cn(
        'flex min-h-[44px] items-center gap-2 rounded-md px-3 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        isCollapsed && 'w-full justify-center px-0',
      )}
    >
      {isCollapsed ? (
        <ChevronRight className="h-4 w-4" />
      ) : (
        <>
          <ChevronLeft className="h-4 w-4" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
