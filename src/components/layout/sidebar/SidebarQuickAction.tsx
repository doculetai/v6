import Link from 'next/link';
import type { Icon } from '@/components/icons';

type SidebarQuickActionProps = {
  label: string;
  icon: Icon;
  href: string;
  isCollapsed: boolean;
};

export function SidebarQuickAction({ label, icon: Icon, href, isCollapsed }: SidebarQuickActionProps) {
  if (isCollapsed) {
    return (
      <Link
        href={href}
        title={label}
        aria-label={label}
        className="flex h-10 w-10 items-center justify-center rounded-xl transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        style={{
          backgroundColor: 'var(--role-accent-bg)',
          color: 'var(--role-accent)',
        }}
      >
        <Icon className="h-5 w-5" weight="duotone" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      style={{
        backgroundColor: 'var(--role-accent-bg)',
        color: 'var(--role-accent)',
        border: '1px solid color-mix(in srgb, var(--role-accent) 22%, transparent)',
      }}
    >
      <Icon className="h-5 w-5 shrink-0" weight="duotone" />
      <span className="truncate">{label}</span>
    </Link>
  );
}
