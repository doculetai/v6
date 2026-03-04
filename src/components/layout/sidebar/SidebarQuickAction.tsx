import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

type SidebarQuickActionProps = {
  label: string;
  icon: LucideIcon;
  href: string;
  isCollapsed: boolean;
};

export function SidebarQuickAction({ label, icon: Icon, href, isCollapsed }: SidebarQuickActionProps) {
  if (isCollapsed) {
    return (
      <div className="px-3 py-1">
        <Link
          href={href}
          title={label}
          aria-label={label}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Icon className="h-5 w-5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="px-3 py-1">
      <Link
        href={href}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-sm transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Icon className="h-5 w-5" />
        {label}
      </Link>
    </div>
  );
}
