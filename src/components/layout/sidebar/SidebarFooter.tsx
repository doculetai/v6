type SidebarFooterProps = { isCollapsed: boolean };

export function SidebarFooter({ isCollapsed }: SidebarFooterProps) {
  if (isCollapsed) return null;

  return (
    <div className="flex items-center gap-3 border-t border-border/50 px-4 py-2 text-xs text-muted-foreground">
      <span>v2.0.0</span>
      <span className="text-primary">Status</span>
      <span className="ml-auto flex items-center gap-1">
        <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-primary/60 dark:bg-primary/40" />
        Active
      </span>
    </div>
  );
}
