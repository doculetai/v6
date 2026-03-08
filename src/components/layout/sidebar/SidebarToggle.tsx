import { CaretLeft, CaretRight } from '@/components/icons';
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
        'flex min-h-11 items-center gap-2 rounded-md px-3 text-xs text-sidebar-foreground/60 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
        isCollapsed && 'w-full justify-center px-0',
      )}
    >
      {isCollapsed ? (
        <CaretRight className="h-4 w-4" weight="duotone" />
      ) : (
        <>
          <CaretLeft className="h-4 w-4" weight="duotone" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
